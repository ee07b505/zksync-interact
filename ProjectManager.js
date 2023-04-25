const {ZKSYNC} = require('./ZKSYNC');
const fs = require('fs');
const util = require('util');
function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function printProgress(current, total) {
    const percentage = ((current / total) * 100).toFixed(2);
    const barLength = Math.floor(percentage / 2);
    const progressBar = '█'.repeat(barLength) + '-'.repeat(50 - barLength);
    const output = `\r[${progressBar}] ${percentage}%`;
    process.stdout.write(output);
}
class ProjectManager {
    constructor(accounts) {
        this.accounts = accounts;
        this.projects = new Map();
        this.currentProject = null;
    }
    async start() {
        await this.loadState();
        while (true) {
            const unfinishedProjects = Array.from(this.projects.values()).filter((project) => !project.isCompleted());

            if (unfinishedProjects.length === 0) {
                console.log('All projects completed.');
                break;
            }

            const project = unfinishedProjects[Math.floor(Math.random() * unfinishedProjects.length)];
            this.currentProject = project;

            const task = project.getNextTask();
            if (task) {
                await project[task]();
            } else {
                console.log(`All tasks completed.`);
            }
            const minSeconds = 0.1 * 60;
            const maxSeconds = 0.2 * 60;
            const totalSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds);//减去4秒
            console.log(`sleep ${totalSeconds} seconds ...`)
            //let currentSecond = 0;
            //const timer = setInterval(() => {
            //    currentSecond += 1;
            //    printProgress(currentSecond, totalSeconds);
            //    if (currentSecond === totalSeconds) {
            //        clearInterval(timer);
            //        console.log('\nDone!');
            //    }
            //}, 1000);
            await sleep(totalSeconds)

        }
    }

    async loadState() {
        try {
            for (const account of this.accounts) {
                const { Num, address, privateKey } = account;
                const project = new ZKSYNC(Num, address, privateKey);
                project.loadState();
                this.projects.set(Num, project);
            }
            console.log('Project state loaded.');
        } catch (err) {
            console.log('Initializing project state...');
        }
    }

}

module.exports = { ProjectManager };
