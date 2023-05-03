const {ZKSYNC} = require('./ZKSYNC');
const fs = require('fs');
const util = require('util');
function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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
            const minSeconds = 0.2 * 60;
            const maxSeconds = 0.5 * 60;
            const totalSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds);//减去4秒
            console.log(`sleep ${totalSeconds} seconds ...`)
            await sleep(totalSeconds)

        }
    }

    async loadState() {
        try {
            for (const account of this.accounts) {
                const { Num, OkxAdress,address, privateKey } = account;
                const project = new ZKSYNC( Num, address, privateKey,OkxAdress);
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
