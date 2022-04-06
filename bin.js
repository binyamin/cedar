import {program} from "commander";

import {serve, build} from "./src/index.js";

program
    .name("cedar")
    .version("0.1.0", "-v, --version");

program
    .command("build <input>", {
        isDefault: true,
        hidden: true
    })
    .description("Build the site")
    .option("-o, --output <path>", "Define the output directory", "out")
    .action(async function(input, opts, _cmd) {
        if(opts.output[0] === "=") opts.output = opts.output.slice(1);
        console.log(`Building ${input} => ${opts.output}`);
        console.time("build");
        await build({
            src: input,
            dest: opts.output
        })
        console.timeEnd("build");
    });

program
    .command("serve <input>")
    .description("server the given folder")
    .option("-p, --port <number>", "Port number", 3000)
    .action(async function(input, opts, _cmd) {
        console.log(`Serving "./${input}" on port ${opts.port}...`);
        await serve({ dir: input, port: opts.port });
    });

program.parse();
