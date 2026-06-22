export const ErrorHandler = (fun)=> {
    return (req , res, next)=> {
        Promise.resolve(fun(req , res ,next).catch(next))
    }
}

export class SendError extends Error {
    constructor(status , message) {
        super(message)
        this.status = status
    }
}