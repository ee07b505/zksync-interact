const {ZKSYNC} = require('./ZKSYNC');
const fs = require('fs');
const util = require('util');
const sleep = util.promisify(setTimeout);

class ProjectManager {
    constructor(accounts) {
        this.accounts = accounts;
        this.projects = new Map();
        this.currentProject = null;
    }
    async start() {
        await this.loadState();
        while (true) {
            const unfinishedProjects = Array.from(this.projects.values())
                .filter((project) => !project.isCompleted());

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

            await sleep(Math.floor(Math.random() * 1200) + 1800);
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
