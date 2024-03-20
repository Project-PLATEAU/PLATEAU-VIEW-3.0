use std::{fs::File, io::BufWriter, path::Path};

use anyhow::Context;
use sevenz_rust::SevenZWriter;

pub fn sevenzip(target: impl AsRef<Path>, zip_path: &Path) -> anyhow::Result<()> {
    let parent = target.as_ref().parent().with_context(|| {
        format!(
            "パス {} から親ディレクトリを取得できませんでした。",
            target.as_ref().display()
        )
    })?;
    let bufw = BufWriter::new(File::create(zip_path)?);
    let mut z = SevenZWriter::new(bufw)?;
    z.set_content_methods(vec![sevenz_rust::SevenZMethodConfiguration {
        method: sevenz_rust::SevenZMethod::LZMA2,
        options: None,
    }]);

    z.push_source_path(parent, |p| {
        p == parent || p == target.as_ref() || p.starts_with(target.as_ref())
    })?;

    z.finish()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use tempdir::TempDir;

    use super::*;

    #[test]
    fn test_sevenzip() -> anyhow::Result<()> {
        let root = TempDir::new("pvt-test")?;
        let input = root.path().join("input");
        let output = root.path().join("output.7z");

        std::fs::create_dir_all(input.join("a"))?;
        std::fs::write(input.join("a").join("a.txt"), "a")?;
        std::fs::write(input.join("b.txt"), "b")?;
        std::fs::write(input.join("c.txt"), "c")?;

        sevenzip(&input, &output)?;

        // copy output to target dir
        std::fs::copy(&output, Path::new("target").join("output.7z"))?;

        assert!(output.exists());

        let mut sz = sevenz_rust::SevenZReader::open(output, "".into())?;
        let mut files: Vec<(String, String)> = vec![];
        sz.for_each_entries(|entry, reader| {
            let mut buf = String::new();
            reader.read_to_string(&mut buf)?;
            let en = entry.name();
            files.push((en.to_string(), buf));
            Ok(true)
        })?;

        files.sort();
        assert_eq!(
            files,
            vec![
                ("input/a/a.txt".to_string(), "a".to_string()),
                ("input/b.txt".to_string(), "b".to_string()),
                ("input/c.txt".to_string(), "c".to_string()),
            ]
        );

        Ok(())
    }
}
