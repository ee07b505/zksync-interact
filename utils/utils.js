 function round_down_up_fromback(BN_wei){
    if(BN_wei.toString().length < 5){
        process.exit("Rounding error code terminated hoho you are trying to transfer millionths of a penny pls reconsider?")
    }
    return (BN_wei.div(10000).sub(1).mul(10000))
}


 function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

const generateRandomAmount = (min, max, num) => {
    const amount = Number(Math.random() * (parseFloat(max) - parseFloat(min)) + parseFloat(min));
    return Number(parseFloat(amount).toFixed(num));
}
module.exports = {  round_down_up_fromback, sleep ,generateRandomAmount}