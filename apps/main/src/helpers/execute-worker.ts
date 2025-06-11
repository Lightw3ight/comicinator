import { Worker } from 'worker_threads';

export async function executeWorker<T>(
    workerPath: string,
    args: any
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const worker = new Worker(workerPath, {
            workerData: args,
        });

        worker.on('error', (err) => {
            reject(err);
            worker.terminate();
        });

        worker.on('message', (response) => {
            resolve(response);
            worker.terminate();
        });
    });
}
