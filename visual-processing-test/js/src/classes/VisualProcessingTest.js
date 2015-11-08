

class VisualProcessingTest extends React.Component {

	constructor(props){
	    super(props);
	    this.state = { myState: 'loading', images: {}, answers: {} };
	    this.loadResources(props.res);

	    this.beforeTestStart = this.beforeTestStart.bind(this); 
	    this.beforeTestDone = this.beforeTestDone.bind(this);
	    this.beforePrimeStart = this.beforePrimeStart.bind(this);

	   
	}

	getImageTypes(){
		return ['templates', 'stimuli'];
	}

	getImageCategories(){
		return ['people', 'animals'];
	}

	loadResources(res){
		var self = this;
		if(!res) throw 'Param res required, containing image resource object';

		// 1. pick subset
		var res = this.getRandomImageSubset(res, 10);

		// 2. load
		var images = {};

		var loadQueue = [];
		var types = this.getImageTypes();
		var categories = this.getImageCategories();
		for(var i in types){
			var type = types[i];
			for(var j in categories){
				var category = categories[j];
				for(var k in res[type][category]){
					var filename = res[type][category][k];
					loadQueue.push({
						filename: filename,
						type: type,
						category: category,
						src: 'res/images/'+type+'/'+category+'/'+filename
					})
				}
			}
		}

		var onAllLoaded = function(){
			console.log('all loaded', images);
			self.setState({ images: images });
			self.loadingDone();
		};

		var loadNext = function(){
			console.log('loadnext');
			if(loadQueue.length === 0){
				onAllLoaded();
				return;
			}
			var item = loadQueue.pop();

			var image = new Image();
			image.onload = function(){
				if(!images[item.filename]) images[item.filename] = {};
				images[item.filename][item.type] = image;
				images[item.filename].category = item.category;
				loadNext();
			};
			image.src = item.src;
		};

		// also need to load noise, do that first, then load everything else
		var noiseImage = new Image();
		noiseImage.onload = loadNext;
		noiseImage.src = 'res/images/noise.jpg';
	}

	getRandomImageSubset(res, num){
		var subset = {
			templates: {
				people: [],
				animals: []
			},
			stimuli: {
				people: [],
				animals: []
			}
		};
		var categories = this.getImageCategories();
		for(var i in categories){
			var category = categories[i];
			var randomIndices = Util.getUniqueRandomNumbers(num, 0, res.templates[category].length - 1);
			for(var j in randomIndices){
				var randomIndex = randomIndices[j];
				subset.templates[category].push(res.templates[category][randomIndex]);
				subset.stimuli[category].push(res.stimuli[category][randomIndex]);
			}
		}

		console.log('subset', subset);

		return subset;
	}

	loadingDone(){
		self.setState({ myState: 'beforeBlock-instructions' });
	}
	beforeBlockStart(){
		this.setState({ myState: 'beforeBlock' });
	}
	beforeBlockDone(answers){
		this.setState({ myState: 'prime-instructions' });
	}
	primeStart(){
		this.setState({ myState: 'prime' });
	}
	primeDone(){
		this.setState({ myState: 'afterBlock-instructions' });
	}
	afterBlockStart(){
		this.setState({ myState: 'afterBlock' });
	}
	afterBlockDone(answers){
		this.setState({ myState: 'done' });
	}

    render(){
    	var s = this.state.myState;

    	var inner = null;
    	if(s == 'loading'){
    		inner = <Loading />;
    	}
    	if(s == 'beforeBlock-instructions' || s == 'prime-instructions' || s == 'afterBlock-instructions'){
    		var onStart;
    		if(s == 'beforeBlock-instructions') onStart = this.beforeBlockStart;
			if(s == 'prime-instructions')       onStart = this.primeStart;
    		if(s == 'afterBlock-instructions')  onStart = this.afterBlockStart;
    		inner = <Instructions myState={s} start={onStart} />
    	}
    	if(s == 'beforeBlock' || s == 'afterBlock'){
    		var onDone;
    		if(s == 'beforeBlock') onDone = this.beforeBlockDone;
    		if(s == 'afterBlock')  onDone = this.afterBlockDone;
    		inner = <Test images={this.state.images} done={onDone} />
    	}
    	if(s == 'prime'){
    		return <Prime images={this.state.images} done={this.primeDone} />
    	}
    	if(s == 'done'){
    		inner = <div>done</div>
    	}
        return <div style={{ width: '800px', height: '600px', background: 'white' }}>
        	{inner}
        </div>
    }
};