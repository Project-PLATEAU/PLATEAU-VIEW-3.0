use std::{
    borrow::Cow,
    fs, io,
    path::{Path, PathBuf},
    sync::mpsc::channel,
};

use anyhow::Context;
use rayon::prelude::*;

const UDX: &str = "udx";
const DIRS: &[&str] = &["codelists", "metadata", "schemas", "specification"];

#[derive(Debug)]
pub struct Files {
    pub dirs: Vec<(String, PathBuf)>,
    pub misc: Vec<PathBuf>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Entry {
    Dir((String, PathBuf)),
    Files((String, Vec<PathBuf>)),
}

pub fn list_files(dir_path: &Path) -> io::Result<Vec<Entry>> {
    let mut entries = vec![];
    let mut misc = vec![];

    for path in read_dir_with_sorted(dir_path)? {
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default();

        match name {
            _ if DIRS.contains(&name) => {
                entries.push(Entry::Dir((name.to_string(), path)));
            }
            UDX => {
                for path in read_dir_with_sorted(&path)? {
                    let name = path
                        .file_name()
                        .unwrap_or_default()
                        .to_str()
                        .unwrap_or_default();

                    entries.push(Entry::Dir((name.to_string(), path)));
                }
            }
            _ => {
                misc.push(path);
            }
        }
    }

    if !misc.is_empty() {
        entries.push(Entry::Files(("misc".to_string(), misc)));
    }

    Ok(entries)
}

#[allow(dead_code)]
pub fn copy_files(files: &[Entry], output_dir: &Path) -> anyhow::Result<Vec<PathBuf>> {
    let (sender, receiver) = channel();

    files
        .par_iter()
        .try_for_each_with(sender, |s, e| -> anyhow::Result<()> {
            let o = copy_file(e, output_dir)?;
            s.send(o)?;
            Ok(())
        })?;

    let mut copied = receiver.iter().flatten().collect::<Vec<_>>();
    copied.sort();

    Ok(copied)
}

const SKIPED_FILES: &[&str] = &[".DS_Store", "Thumbs.db", "__MACOSX"];

pub fn copy_file(e: &Entry, output_dir: &Path) -> anyhow::Result<Option<PathBuf>> {
    let name = match e {
        Entry::Dir((name, _)) => name,
        Entry::Files((name, _)) => name,
    };

    if SKIPED_FILES.contains(&name.as_str()) {
        return Ok(None);
    }

    let opts: fs_extra::dir::CopyOptions = fs_extra::dir::CopyOptions {
        overwrite: true,
        ..Default::default()
    };

    let files = match e {
        Entry::Dir((_, path)) => {
            if path.is_dir() {
                read_dir_with_sorted(path)
                    .with_context(|| {
                        format!(
                            "{} ディレクトリのファイル一覧の取得に失敗しました。",
                            path.display()
                        )
                    })?
                    .into_iter()
                    .map(Cow::Owned)
                    .collect()
            } else {
                vec![Cow::Borrowed(path)]
            }
        }
        Entry::Files((_, paths)) => paths.iter().map(Cow::Borrowed).collect(),
    };
    let files = files.iter().map(|p| p.as_path()).collect::<Vec<_>>();

    let output_dir = output_dir.join(name);
    fs::create_dir_all(&output_dir)?;
    fs_extra::copy_items(&files, &output_dir, &opts)
        .with_context(|| format!("{} ディレクトリのファイルのコピーに失敗しました。", name))?;

    Ok(Some(output_dir))
}

fn read_dir_with_sorted(dir_path: &Path) -> io::Result<Vec<PathBuf>> {
    let mut files = fs::read_dir(dir_path)?.collect::<io::Result<Vec<_>>>()?;

    files.sort_by(|a, b| {
        a.file_name()
            .cmp(&b.file_name())
            .then(a.path().cmp(&b.path()))
    });

    Ok(files.into_iter().map(|entry| entry.path()).collect())
}

#[cfg(test)]
mod tests {
    use tempdir::TempDir;

    use super::*;

    #[test]
    fn test_list_files() -> anyhow::Result<()> {
        let tmpdir = TempDir::new("pvt-test")?;
        let root = tmpdir.path().join("26100_kyoto-shi_city_2022_citygml_3");

        create_dummy_files(&root)?;
        let files = list_files(&root).unwrap();

        assert_eq!(
            files,
            vec![
                Entry::Dir(("codelists".to_string(), root.join("codelists"))),
                Entry::Dir(("metadata".to_string(), root.join("metadata"))),
                Entry::Dir(("schemas".to_string(), root.join("schemas"))),
                Entry::Dir(("specification".to_string(), root.join("specification"))),
                Entry::Dir(("bldg".to_string(), root.join("udx").join("bldg"))),
                Entry::Dir(("tran".to_string(), root.join("udx").join("tran"))),
                Entry::Files((
                    "misc".to_string(),
                    vec![root.join("26100_indexmap.pdf"), root.join("README.md"),]
                )),
            ],
        );

        Ok(())
    }

    #[test]
    fn test_copy_files() -> anyhow::Result<()> {
        let tmpdir = TempDir::new("pvt-test")?;
        let root = tmpdir.path().join("26100_kyoto-shi_city_2022_citygml_3");

        create_dummy_files(&root)?;
        let entries = list_files(&root).unwrap();

        let output_dir = tmpdir.path().join("output");
        copy_files(&entries, &output_dir)?;

        let result = read_dir_with_sorted(&output_dir)?;
        assert_eq!(
            result,
            vec![
                output_dir.join("bldg"),
                output_dir.join("codelists"),
                output_dir.join("metadata"),
                output_dir.join("misc"),
                output_dir.join("schemas"),
                output_dir.join("specification"),
                output_dir.join("tran"),
            ]
        );

        let result = read_dir_with_sorted(output_dir.join("codelists").as_path())?;
        assert_eq!(result, vec![output_dir.join("codelists").join("hoge.gml")]);

        let result = read_dir_with_sorted(output_dir.join("schemas").as_path())?;
        assert_eq!(result, vec![output_dir.join("schemas").join("iur")]);

        let result = read_dir_with_sorted(output_dir.join("specification").as_path())?;
        assert_eq!(result, vec![output_dir.join("specification").join("iur")]);

        let result = read_dir_with_sorted(output_dir.join("metadata").as_path())?;
        assert_eq!(result, vec![output_dir.join("metadata").join("foo.gml")]);

        let result = read_dir_with_sorted(output_dir.join("bldg").as_path())?;
        assert_eq!(result, vec![output_dir.join("bldg").join("bar.gml")]);

        let result = read_dir_with_sorted(output_dir.join("tran").as_path())?;
        assert_eq!(result, vec![output_dir.join("tran").join("fuga.gml")]);

        let result = read_dir_with_sorted(output_dir.join("misc").as_path())?;
        assert_eq!(
            result,
            vec![
                output_dir.join("misc").join("26100_indexmap.pdf"),
                output_dir.join("misc").join("README.md"),
            ]
        );

        Ok(())
    }

    fn create_dummy_files(root: &Path) -> io::Result<()> {
        fs::create_dir_all(root.join("codelists"))?;
        fs::create_dir_all(root.join("metadata"))?;
        fs::create_dir_all(root.join("schemas"))?;
        fs::create_dir_all(root.join("specification"))?;
        fs::create_dir_all(root.join("udx").join("bldg"))?;
        fs::create_dir_all(root.join("udx").join("tran"))?;
        fs::write(root.join("codelists").join("hoge.gml"), "dummy")?;
        fs::write(root.join("metadata").join("foo.gml"), "dummy")?;
        fs::write(root.join("schemas").join("iur"), "dummy")?;
        fs::write(root.join("specification").join("iur"), "dummy")?;
        fs::write(root.join("udx").join("bldg").join("bar.gml"), "dummy")?;
        fs::write(root.join("udx").join("tran").join("fuga.gml"), "dummy")?;
        fs::write(root.join("26100_indexmap.pdf"), "dummy")?;
        fs::write(root.join("README.md"), "dummy")?;
        Ok(())
    }
}
