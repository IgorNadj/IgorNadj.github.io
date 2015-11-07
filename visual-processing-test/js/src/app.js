'use strict';


class VisualProcessingTest extends React.Component {

	constructor(props){
	    super(props);
	    this.state = { myState: 'loading', images: {}, answers: {} };
	    this.loadResources(props.res);

	    this.onNext = this.onNext.bind(this); // ... so we can access this
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

		var images = {};

		// TODO: pick a subset at random

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
			self.setState({ myState: 'pre-before-test' });
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

	onNext(){
		console.log('on next');
		if(this.state.myState == 'pre-before-test'){
			this.setState({ myState: 'before-test' });
		}
	}

	beforeTestDone(answers){

	}

	afterTestDone(answers){

	}

    render(){
    	var inner = null;
    	if(this.state.myState == 'loading'){
    		inner = <Loading />;	
    	}
    	if(this.state.myState == 'pre-before-test'){
    		inner = <Instructions myState="pre-before-test" onNext={this.onNext} />
    	}
    	if(this.state.myState == 'before-test'){
    		inner = <Test images={this.state.images} done={this.beforeTestDone} />
    	}
    	// prime
    	if(this.state.myState == 'after-test'){
    		inner = <Test images={this.state.images} done={this.afterTestDone} />
    	}
        return <div style={{ width: '800px', height: '600px', background: 'white' }}>
        	{inner}
        </div>
    }
};
 

class Loading extends React.Component {
	render(){
		return <div>Loading...</div>
	}
}

class Instructions extends React.Component {

	render(){
		var content = null;
		if(this.props.myState == 'pre-before-test'){
			content = <div>
				<p>This test consists of three parts.</p>
				<ol>
					<li>Test</li>
					<li>Priming</li>
					<li>Test</li>
				</ol>
				<p>You will be given instructions before each part.</p>
			</div>
		}
		return <div style={{ padding: '3em' }}>
			<h2>Instructions</h2>
			<div>
				{ content }
			</div>
			<a href="#" onClick={this.props.onNext} >Start</a>
		</div> 
	}
}

class Test extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			images: props.images,
			currentImageIndex: 0,
			answers: {}
		};
		
		this.next = this.next.bind(this);
		this.getImageAtIndex = this.getImageAtIndex.bind(this);
	}

	next(answeredYes){
		console.log('next', answeredYes);

		var curIndex = this.state.currentImageIndex;

		var answers = this.state.answers;
		answers[curIndex] = answeredYes;
		this.setState({ answers: answers });

		var nextIndex = curIndex + 1;
		if(nextIndex >= this.state.images.length){
			// finished
			console.log('test done, shipping answers');
			this.props.done(this.state.answers);

		}else{
			console.log('going to next stimuli', nextIndex);
			this.setState({ currentImageIndex: nextIndex });
		}


	}

	getImageAtIndex(index){
		var image = null;
		var count = 0;
		var type = 'stimuli'; // tests always use stimuli type
		for(var filename in this.state.images){
			if(count == index){
				image = this.state.images[filename][type];
				break;
			}
			count++;
		}
		return image;
	}	

	render(){
		var image = this.getImageAtIndex(this.state.currentImageIndex);
		return <TestPhoto imageSrc={image.src} done={this.next} /> 
	}

}

class TestPhoto extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			myState: 'loading',
			times: {
				init: new Date()
			}
		}

		this.show = this.show.bind(this);
		this.noise = this.noise.bind(this);
		this.answer = this.answer.bind(this);
		this.addTime = this.addTime.bind(this);
		this.answerYes = this.answerYes.bind(this);
		this.answerNo = this.answerNo.bind(this);

		// cant setState yet... so have to do a setTimeout 0 here
		setTimeout(this.show, 0);
	}

	componentWillReceiveProps(){
		console.log('componentWillReceiveProps');
		this.setState({ myState: 'loading' });
		this.setState({ times: { init: new Date() } });
		setTimeout(this.show, 0);
	}

	show(){		
		this.setState({ myState: 'show' });
		this.addTime('show');
		this.forceUpdate();	
		setTimeout(this.noise, 400);	
	}

	noise(){
		this.setState({ myState: 'noise' });
		this.addTime('noise');
		this.forceUpdate();
		setTimeout(this.answer, 100);
	}

	answer(){
		this.setState({ myState: 'answer' });
		this.addTime('answer');
		this.forceUpdate();

		console.log('init took: '+ this.getTimeDiff(this.state.times.init, this.state.times.show));
		console.log('show took: '+ this.getTimeDiff(this.state.times.show, this.state.times.noise));
		console.log('noise took: '+ this.getTimeDiff(this.state.times.noise, this.state.times.answer));	
	}

	addTime(name){
		var times = this.state.times;
		times[name] = new Date();
		this.setState({ times: times });
	}

	getTimeDiff(a, b){
		return b.getTime() - a.getTime();
	}

	answerYes(){
		console.log('yes');
		this.props.done(true);
	}

	answerNo(){
		console.log('no');
		this.props.done(false);
	}

	render(){
		var style = { width: '800px', height: '600px', display: 'block' };
		if(this.state.myState == 'show'){
			return <img style={style} src={this.props.imageSrc} />
		}
		if(this.state.myState == 'noise'){
			return <img style={style} src="res/images/noise.jpg" />
		}
		if(this.state.myState == 'answer'){
			return <div style={style}>
				<div style={{ textAlign: 'center', padding: '280px 3em', }}>
					<strong>Did you see a person in the photo?</strong>
					<div style={{ padding: '1em' }}>
						<button onClick={this.answerYes} style={{ margin: '1em' }}>Yes</button>
						<button onClick={this.answerNo} style={{ margin: '1em' }}>No</button>
					</div>
				</div>
			</div>
		}
		return <div style={style} />
	}
}




ReactDOM.render(
	<VisualProcessingTest res={window.VPT_IMAGES} />,
    document.getElementById('app')
);
