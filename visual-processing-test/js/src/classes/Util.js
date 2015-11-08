

class Util {

	static getUniqueRandomNumbers(num, min, max){
		var arr = []
		while(arr.length < num){
			var rand = Util.getRandomInt(min, max);
			var found = false;
			for(var i = 0; i < arr.length; i++){
				if(arr[i] == rand){
					found = true;
					break
				}
			}
			if(!found) arr.push(rand);
		}
		return arr;
	}

	static getRandomInt(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}