//"use strict";
function deleteJobProcess(resourceManagerProvider) {
    return async function deleteJobProcess(event) {
        let jobProcessId = event.input.jobProcessId;

        try {
            let resourceManager = resourceManagerProvider.get(event);
            await resourceManager.delete(jobProcessId);
        } catch (error) {
            console.error(error);
        }
    };
}

module.exports = deleteJobProcess;
