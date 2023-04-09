List=[false]
function isCompleted(list) {
    return list.every(task => task );
}


console.log(isCompleted(List))
List[7] = false
console.log(List)
console.log(isCompleted(List))
