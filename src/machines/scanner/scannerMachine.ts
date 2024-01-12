import { createMachine, fromPromise, assign } from "xstate";

export const scannerMachine = createMachine(
    {
      context: ({ input }) => ({
        basePath: input.basePath,
        destinationPath: input.destinationPath,
        directoriesToCheck: [],
        dirsToEvaluate: [],
        dirsToMove: [],
        filesToEmail: [],
        dirsToReport: [],
        processedFiles: [],
        acceptedFileTypes: [
          "mp4",
          "mkv",
          "avi",
          "mov",
          "m4v",
          "mpg",
          "mpeg",
          "wmv",
          "flv",
          "ts",
          "mts",
        ],
      }),
      id: "scanner-machine",
      initial: "idle",
      states: {
        idle: {
          on: {
            START_SCAN: {
              target: "Scanning",
            },
          },
        },
        Scanning: {
          description:
              'Scan the media library and check for directories \n\nFor every file we can confirm is a directory, we add it to the context. \n\nIgnore the files already present in the ledger. Those are "known good"',
          invoke: {
            input: {},
            src: "libraryScanner",
            id: "scanLibrary",
            onDone: [
              {
                target: "CheckingFilePermissions",
                actions: {
                  type: "directoriesToCheck",
                },
              },
            ],
            onError: [
              {
                target: "ReportingErrors",
              },
            ],
          },
        },
        CheckingFilePermissions: {
          description:
              "check the file permissions for all the files we need to scan.\n\nif we do not have read/write permissions, we update the context with the filenames/locations.\n\nif there are no files with read/write permissions, we move to the error state",
          invoke: {
            input: {},
            src: "filePermissionsChecker",
            id: "checkFilePermissions",
            onDone: [
              {
                target: "EvaluatingFiles",
                actions: {
                  type: "dirsToEvalFn",
                },
              },
            ],
            onError: [
              {
                target: "ReportingErrors",
                actions: {
                  type: "dirsToReportFn",
                },
              },
            ],
          },
        },
        ReportingErrors: {
          description:
              "Send a message with error details to the proper destination.\n\nErrors could be the lack of read/write permissions or path not existing",
          entry: {
            type: "emailErrors",
          },
          on: {
            RESTART: {
              target: "idle",
            },
          },
        },
        EvaluatingFiles: {
          description:
              "Evaluate the files to determine their resolution. If they are 4K, move them to a new directory",
          invoke: {
            input: {},
            src: "evalFilesFn",
            id: "evaluatingFiles",
            onDone: [
              {
                target: "MovingFiles",
                actions: {
                  type: "dirsToMoveFn",
                },
              },
            ],
          },
        },
        MovingFiles: {
          description:
              "Move all the files present in context to the destination library",
          invoke: {
            input: {},
            src: "moveFilesFn",
            id: "moveFiles",
            onDone: [
              {
                target: "idle",
              },
            ],
            onError: [
              {
                target: "ReportingErrors",
              },
            ],
          },
        },
      },
      types: { events: {} as { type: "RESTART" } | { type: "START_SCAN" } },
    },
    {
      actions: {
        emailErrors: ({ context, event }) => {},
        directoriesToCheck: assign({
          directoriesToCheck: ({ event }) => event.output,
        }),
        dirsToReportFn: assign(({ event }) => {
          return {
            dirsToReport: event.error["dirsToReport"],
          };
        }),
        dirsToEvalFn: assign(({ event }) => {
          return {
            dirsToEvaluate: event.output["dirsToEvaluate"],
            dirsToReport: event.output["dirsToReport"],
          };
        }),
        dirsToMoveFn: assign(({ event }) => {
          return {
            dirsToMove: event.output["dirsToMove"],
          };
        }),
      },
      actors: {
        libraryScanner: fromPromise(
            async ({ input }) => await scanDirectories(input.basePath),
        ),
        filePermissionsChecker: fromPromise(
            async ({ input: { directoriesToCheck } }) =>
                await checkFilePermissions(directoriesToCheck),
        ),
        evalFilesFn: fromPromise(
            async ({ input: { dirsToEvaluate, acceptedFileTypes } }) =>
                await evaluateFiles(dirsToEvaluate, acceptedFileTypes),
        ),
        moveFilesFn: fromPromise(
            async ({ input: { dirsToMove, destinationPath } }) =>
                await moveFiles(dirsToMove, destinationPath),
        ),
      },
      guards: {},
      delays: {},
    },
);


export async function moveFiles(
    dirsToMove: string[],
    destinationBasePath: string
) {
  try {
    logger.info('moving files...');

    const errors: Array<{ source: string; destination: string; error: any }> =
        [];



    if (errors.length > 0) {
      return { message: 'files moved with errors', errors };
    } else {
      return { message: 'all files moved successfully' };
    }
  } catch (error) {
    throw { message: 'Error moving files', error };
  }
}



export async function scanDirectories(basePath: string) {
  try {
    const validDirectories: string[] = [];


    if (validDirectories.length === 0) {
      throw new Error('No valid directories found');
    }

    return validDirectories;
  } catch (error) {
    throw new Error('Unable to scan directory: ' + error.message);
  }
}

export async function checkFilePermissions(directories: string[]) {
  try {
    logger.info('checking directory permissions...');

    const promises = directories.map(async (dir) => {
      try {
        // await fs.access(dir, fs.constants.R_OK | fs.constants.W_OK);
        logger.info(`directory ${dir} is accessible`);
        return { dir, status: 'accessible' };
      } catch (err) {
        logger.error(`cannot access directory ${dir}. Error: ${err}`);
        return { dir, status: 'inaccessible', error: err };
      }
    });

    const results = await Promise.all(promises);

    const dirsToEvaluate = results
        .filter((result) => result.status === 'accessible')
        .map((result) => result.dir);
    const dirsToReport = results
        .filter((result) => result.status === 'inaccessible')
        .map((result) => result.dir);

    if (dirsToEvaluate.length === 0) {
      throw { message: 'No accessible files found to move', dirsToReport };
    }

    return { dirsToEvaluate, dirsToReport };
  } catch (error) {
    throw { message: 'Error checking file permissions', error };
  }
}

export async function evaluateFiles(
    dirsToEvaluate: string[],
    acceptedFileTypes: string[]
) {
  try {
    logger.info('checking files in directories...');
    const dirsToMove: string[] = [];

    for (const dir of dirsToEvaluate) {
      try {
        // read the directory's files
        const filenames = await fs.readdir(dir);

        // check each file's type
        for (const file of filenames) {
          // if the file is a valid type, check the file's dimensions
          const fileExtension = file.split('.').pop();
          if (fileExtension && acceptedFileTypes.includes(fileExtension)) {
            // read the file's dimensions
            const result = await probe(path.join(dir, file));
            if (
                result.streams[0].width > 1920 &&
                result.streams[0].height > 1080
            ) {
              logger.info(`file ${file} is greater than 1080p. Assuming 4K`);
              dirsToMove.push(path.join(dir, file));
            }
          }
        }
      } catch (error) {
        console.log(`error reading directory ${dir}: `, error);
        //todo: add to a collection of directories that we need to report
      }
    }

    if (dirsToMove.length === 0) {
      throw { message: 'No files found to move', dirsToMove };
    }

    return { dirsToMove };
  } catch (error) {
    throw { message: 'Error evaluating files', error };
  }
}
