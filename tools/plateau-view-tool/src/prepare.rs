use std::path::PathBuf;

use anyhow::ensure;

pub use self::compress::Format;

mod check;
mod compress;
mod list;
mod sevenzip;
mod zip;

pub struct Config {
    pub input: Vec<PathBuf>,
    pub output: Option<PathBuf>,
    pub format: Format,
}

pub fn prepare(config: Config) -> anyhow::Result<()> {
    for input in config.input.iter() {
        ensure!(
            input.is_dir(),
            "{} はディレクトリではありません。",
            input.display(),
        );

        ensure!(
            check::check_dir_name(
                input
                    .file_name()
                    .unwrap_or_default()
                    .to_str()
                    .unwrap_or_default()
            ),
            "フォルダ {} は正しい命名規則に従っていません。 26100_kyoto-shi_city_2022_citygml_3 のような名前にする必要があります。",
            input.file_name().unwrap_or_default().to_str().unwrap_or_default(),
        );
    }

    for input in config.input {
        eprintln!("{} を処理しています。", input.display());
        compress::compress_files(&input, config.output.as_ref(), &config.format)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::{fs, io, path::Path};

    use tempdir::TempDir;

    use super::*;

    #[test]
    fn test_prepare() -> anyhow::Result<()> {
        let root = TempDir::new("pvt-test")?;
        let input = root.path().join("26100_kyoto-shi_city_2022_citygml_3");
        create_dummy_files(&input)?;
        let output = root.path().join("output.zip");

        prepare(Config {
            input: vec![input],
            output: Some(output.clone()),
            format: Format::Zip,
        })?;

        let files = read_dir_with_sorted(
            output
                .join("26100_kyoto-shi_city_2022_citygml_3_files")
                .as_path(),
        )?
        .into_iter()
        .filter_map(|f| {
            f.file_name()
                .unwrap_or_default()
                .to_str()
                .map(|s| s.to_string())
        })
        .collect::<Vec<_>>();
        assert_eq!(
            files,
            vec![
                "26100_kyoto-shi_city_2022_citygml_3_bldg.zip",
                "26100_kyoto-shi_city_2022_citygml_3_codelists.zip",
                "26100_kyoto-shi_city_2022_citygml_3_metadata.zip",
                "26100_kyoto-shi_city_2022_citygml_3_misc.zip",
                "26100_kyoto-shi_city_2022_citygml_3_schemas.zip",
                "26100_kyoto-shi_city_2022_citygml_3_specification.zip",
                "26100_kyoto-shi_city_2022_citygml_3_tran.zip",
                "bldg",
                "codelists",
                "metadata",
                "misc",
                "schemas",
                "specification",
                "tran",
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

    fn read_dir_with_sorted(dir_path: &Path) -> io::Result<Vec<PathBuf>> {
        let mut files = fs::read_dir(dir_path)?.collect::<io::Result<Vec<_>>>()?;

        files.sort_by(|a, b| {
            a.file_name()
                .cmp(&b.file_name())
                .then(a.path().cmp(&b.path()))
        });

        Ok(files.into_iter().map(|entry| entry.path()).collect())
    }
}
