mod args;
mod prepare;
use args::{Cli, Commands};

use clap::Parser;

fn main() {
    let cli = Cli::parse();

    if let Err(err) = match cli.command {
        Commands::Prepare {
            format,
            targets,
            output,
        } => prepare::prepare(prepare::Config {
            input: targets,
            output,
            format: format.into(),
        }),
    } {
        eprintln!("{}", err);
        std::process::exit(1);
    }
}
