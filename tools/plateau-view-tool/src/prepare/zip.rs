use std::{
    fs::File,
    io::{copy, BufWriter, Write},
    path::{Path, PathBuf},
};

use anyhow::{ensure, Context as _};
use walkdir::WalkDir;
use zip::ZipWriter;

pub fn zip(p: impl AsRef<Path>, zip_path: &Path) -> anyhow::Result<()> {
    let bufw = BufWriter::new(File::create(zip_path)?);
    let mut zw = ZipWriter::new(bufw);

    ensure!(
        p.as_ref().is_dir(),
        "{} はディレクトリではありません。",
        p.as_ref().display()
    );

    let pname = PathBuf::from(p.as_ref().file_name().unwrap_or_default());
    for entry in WalkDir::new(p.as_ref()) {
        let entry = entry.context("ファイルを取得できませんでした。")?;
        let path = entry.path();
        let relative_path = path.strip_prefix(p.as_ref())?;
        let path_str = pname
            .join(relative_path)
            .to_str()
            .unwrap_or_default()
            .to_string();

        if path.is_dir() {
            zw.add_directory(path_str, Default::default())
                .with_context(|| {
                    format!(
                        "{} を圧縮ファイルに追加できませんでした。",
                        entry.path().display()
                    )
                })?
        } else {
            zw.start_file(path_str, Default::default())
                .with_context(|| {
                    format!(
                        "{} を圧縮ファイルに追加できませんでした。",
                        entry.path().display()
                    )
                })?;
            copy(
                &mut File::open(path).context("ファイルを開くことができませんでした。")?,
                &mut zw,
            )
            .with_context(|| {
                format!(
                    "{} を圧縮ファイルに追加できませんでした。",
                    entry.path().display()
                )
            })?;
        }
    }

    zw.flush()?;
    zw.finish()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::io::Read as _;

    use tempdir::TempDir;

    use super::*;

    #[test]
    fn test_zip() -> anyhow::Result<()> {
        let root = TempDir::new("pvt-test")?;
        let input = root.path().join("input");
        let output = root.path().join("output.zip");

        std::fs::create_dir_all(input.join("a"))?;
        std::fs::write(input.join("a").join("a.txt"), "a")?;
        std::fs::write(input.join("b.txt"), "b")?;
        std::fs::write(input.join("c.txt"), "c")?;

        zip(&input, &output)?;

        assert!(output.exists());

        let mut zr = zip::read::ZipArchive::new(File::open(output)?)?;
        let mut files = zr.file_names().collect::<Vec<_>>();
        files.sort();
        assert_eq!(
            files,
            vec![
                "input/",
                "input/a/",
                "input/a/a.txt",
                "input/b.txt",
                "input/c.txt"
            ]
        );

        let mut buf = String::new();
        zr.by_name("input/a/a.txt")?.read_to_string(&mut buf)?;
        assert_eq!(buf, "a");

        let mut buf = String::new();
        zr.by_name("input/b.txt")?.read_to_string(&mut buf)?;
        assert_eq!(buf, "b");

        let mut buf = String::new();
        zr.by_name("input/c.txt")?.read_to_string(&mut buf)?;
        assert_eq!(buf, "c");

        Ok(())
    }
}
