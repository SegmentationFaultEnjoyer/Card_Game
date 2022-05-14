export default class ActionQueue {
    constructor() {
        this.IsActive = false;
        this.queue = [];
    }

    add(action) {
        this.queue.push(action);
        if(!this.IsActive) this.execute();
    }

    front() {
        return this.queue.shift();
    }
   
    async execute() {
        try {
            if(!this.IsActive) {
                this.IsActive = true;
                while(this.queue.length > 0) {
                    let action = this.front();
                    let res = await action.func(...action.params);
                }
                this.IsActive = false;
            }
        } catch (error) {
            console.log(error);
        }
       
    }
}