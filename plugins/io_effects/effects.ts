export type FileExistsEffect = {
	fileExists: (filename: string) => Promise<boolean>;
};

export type TempFileEffect = {
	createTempFile: (content: string) => Promise<string>;
};

export type CommandOutputEffect = {
	getIterFromCmds: (cmds: string[]) => AsyncIterableIterator<string>;
	runCmds: (cmds: string[]) => Promise<void>;
};

export type RemoveFileEffect = {
	removeFile: (filename: string) => Promise<void>;
};

export type WriteTextFileEffect = {
	writeTextFile: (filename: string, content: string) => Promise<void>;
};

export type ReadTextFileEffect = {
	readTextFile: (filename: string) => Promise<string>;
};

export type RunProcessEffect = {
	runProcess: typeof Deno.run;
};

export type CreateDirectoryEffect = {
	mkdir: (dirname: string) => Promise<void>;
};

export type ReadEnvironmentalVariableEffect = {
	readEnv: (varname: string) => string | undefined;
}

export type WriteEnvironmentalVariableEffect = {
	writeEnv: (varname: string, value: string) => void;
}

export type ReadDirectoryEffect = {
	readDir: (dirname: string) => AsyncIterableIterator<string>;
}

type BinaryApp = string;

export type BinaryFileReader = {
	bins: {
		frequencyChecker: BinaryApp;
		dicer: BinaryApp;
		encoder: BinaryApp;
		wordlist: BinaryApp;
	};
};
