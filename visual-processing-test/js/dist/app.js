'use strict';


class Instructions extends React.Component {

	render() {
		var content = null;
		if (this.props.myState == 'pre-before-test') {
			content = React.createElement(
				'div',
				null,
				React.createElement(
					'p',
					null,
					'This test consists of three parts.'
				),
				React.createElement(
					'ol',
					null,
					React.createElement(
						'li',
						null,
						'Test'
					),
					React.createElement(
						'li',
						null,
						'Priming'
					),
					React.createElement(
						'li',
						null,
						'Test'
					)
				),
				React.createElement(
					'p',
					null,
					'This first test involves quick flashes of 10 black and white images, and asks you to answer a simple question.'
				),
				React.createElement(
					'p',
					null,
					'Prepare to pay attention and click start.'
				)
			);
		}
		if (this.props.myState == 'pre-prime') {
			content = React.createElement(
				'div',
				null,
				React.createElement(
					'p',
					null,
					'First test done.'
				),
				React.createElement(
					'p',
					null,
					'Next you will see the colour images, which were used to generate the black and white images.'
				),
				React.createElement(
					'p',
					null,
					'Watch carefully, they will appear briefly.'
				)
			);
		}
		return React.createElement(
			'div',
			{ style: { padding: '3em' } },
			React.createElement(
				'h2',
				null,
				'Instructions'
			),
			React.createElement(
				'div',
				null,
				content
			),
			React.createElement(
				'a',
				{ href: '#', onClick: this.props.start },
				'Start'
			)
		);
	}
}


class Loading extends React.Component {
	render() {
		return React.createElement(
			"div",
			null,
			"Loading..."
		);
	}
}


class Test extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			images: props.images,
			currentImageIndex: 0,
			answers: {}
		};

		this.next = this.next.bind(this);
		this.getImageAtIndex = this.getImageAtIndex.bind(this);
	}

	next(answeredYes) {
		// TODO: randomise order
		console.log('next', answeredYes);

		var curIndex = this.state.currentImageIndex;

		var answers = this.state.answers;
		answers[curIndex] = answeredYes;
		this.setState({ answers: answers });

		var nextIndex = curIndex + 1;

		var numImages = Object.keys(this.state.images).length;

		// console.log('Test::next', this, this.state.images.length, nextIndex);
		if (nextIndex >= numImages) {
			// finished
			console.log('test done, shipping answers');
			this.props.done(this.state.answers);
		} else {
			console.log('going to next stimuli', nextIndex);
			this.setState({ currentImageIndex: nextIndex });
		}
	}

	getImageAtIndex(index) {
		var image = null;
		var count = 0;
		var type = 'stimuli'; // tests always use stimuli type
		for (var filename in this.state.images) {
			if (count == index) {
				image = this.state.images[filename][type];
				break;
			}
			count++;
		}
		return image;
	}

	render() {
		var image = this.getImageAtIndex(this.state.currentImageIndex);
		return React.createElement(TestPhoto, { imageSrc: image.src, done: this.next });
	}

}


class TestPhoto extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			myState: 'loading',
			times: {
				init: new Date()
			}
		};

		this.show = this.show.bind(this);
		this.noise = this.noise.bind(this);
		this.answer = this.answer.bind(this);
		this.addTime = this.addTime.bind(this);
		this.answerYes = this.answerYes.bind(this);
		this.answerNo = this.answerNo.bind(this);

		// cant setState yet... so have to do a setTimeout 0 here
		setTimeout(this.show, 0);
	}

	componentWillReceiveProps() {
		console.log('componentWillReceiveProps');
		this.setState({ myState: 'loading' });
		this.setState({ times: { init: new Date() } });
		setTimeout(this.show, 0);
	}

	show() {
		this.setState({ myState: 'show' });
		this.addTime('show');
		this.forceUpdate();
		setTimeout(this.noise, 400);
	}

	noise() {
		this.setState({ myState: 'noise' });
		this.addTime('noise');
		this.forceUpdate();
		setTimeout(this.answer, 100);
	}

	answer() {
		this.setState({ myState: 'answer' });
		this.addTime('answer');
		this.forceUpdate();

		console.log('init took: ' + this.getTimeDiff(this.state.times.init, this.state.times.show));
		console.log('show took: ' + this.getTimeDiff(this.state.times.show, this.state.times.noise));
		console.log('noise took: ' + this.getTimeDiff(this.state.times.noise, this.state.times.answer));
	}

	addTime(name) {
		var times = this.state.times;
		times[name] = new Date();
		this.setState({ times: times });
	}

	getTimeDiff(a, b) {
		return b.getTime() - a.getTime();
	}

	answerYes() {
		console.log('yes');
		this.props.done(true);
	}

	answerNo() {
		console.log('no');
		this.props.done(false);
	}

	render() {
		var style = { width: '800px', height: '600px', display: 'block' };
		if (this.state.myState == 'show') {
			return React.createElement('img', { style: style, src: this.props.imageSrc });
		}
		if (this.state.myState == 'noise') {
			return React.createElement('img', { style: style, src: 'res/images/noise.jpg' });
		}
		if (this.state.myState == 'answer') {
			return React.createElement(
				'div',
				{ style: style },
				React.createElement(
					'div',
					{ style: { textAlign: 'center', padding: '280px 3em' } },
					React.createElement(
						'strong',
						null,
						'Did you see a person in the photo?'
					),
					React.createElement(
						'div',
						{ style: { padding: '1em' } },
						React.createElement(
							'button',
							{ onClick: this.answerYes, style: { margin: '1em' } },
							'Yes'
						),
						React.createElement(
							'button',
							{ onClick: this.answerNo, style: { margin: '1em' } },
							'No'
						)
					)
				)
			);
		}
		return React.createElement('div', { style: style });
	}
}


class Util {

	static getUniqueRandomNumbers(num, min, max) {
		var arr = [];
		while (arr.length < num) {
			var rand = Util.getRandomInt(min, max);
			var found = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] == rand) {
					found = true;
					break;
				}
			}
			if (!found) arr.push(rand);
		}
		return arr;
	}

	static getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}


class VisualProcessingTest extends React.Component {

	constructor(props) {
		super(props);
		this.state = { myState: 'loading', images: {}, answers: {} };
		this.loadResources(props.res);

		this.onNext = this.onNext.bind(this); // ... so we can access this
		this.beforeTestDone = this.beforeTestDone.bind(this);
		this.afterTestDone = this.afterTestDone.bind(this);
	}

	getImageTypes() {
		return ['templates', 'stimuli'];
	}

	getImageCategories() {
		return ['people', 'animals'];
	}

	loadResources(res) {
		var self = this;
		if (!res) throw 'Param res required, containing image resource object';

		// 1. pick subset
		var res = this.getRandomImageSubset(res, 10);

		// 2. load
		var images = {};

		var loadQueue = [];
		var types = this.getImageTypes();
		var categories = this.getImageCategories();
		for (var i in types) {
			var type = types[i];
			for (var j in categories) {
				var category = categories[j];
				for (var k in res[type][category]) {
					var filename = res[type][category][k];
					loadQueue.push({
						filename: filename,
						type: type,
						category: category,
						src: 'res/images/' + type + '/' + category + '/' + filename
					});
				}
			}
		}

		var onAllLoaded = function () {
			console.log('all loaded', images);
			self.setState({ images: images });
			self.setState({ myState: 'pre-before-test' });
		};

		var loadNext = function () {
			console.log('loadnext');
			if (loadQueue.length === 0) {
				onAllLoaded();
				return;
			}
			var item = loadQueue.pop();

			var image = new Image();
			image.onload = function () {
				if (!images[item.filename]) images[item.filename] = {};
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

	getRandomImageSubset(res, num) {
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
		for (var i in categories) {
			var category = categories[i];
			var randomIndices = Util.getUniqueRandomNumbers(num, 0, res.templates[category].length - 1);
			for (var j in randomIndices) {
				var randomIndex = randomIndices[j];
				subset.templates[category].push(res.templates[category][randomIndex]);
				subset.stimuli[category].push(res.stimuli[category][randomIndex]);
			}
		}

		console.log('subset', subset);

		return subset;
	}

	onNext() {
		console.log('on next');
		if (this.state.myState == 'pre-before-test') {
			this.setState({ myState: 'before-test' });
		}
	}

	beforeTestDone(answers) {
		console.log('beforeTestDone');
		this.setState({ myState: 'pre-prime' });
	}

	afterTestDone(answers) {}

	render() {
		var inner = null;
		if (this.state.myState == 'loading') {
			inner = React.createElement(Loading, null);
		}
		if (this.state.myState == 'pre-before-test') {
			inner = React.createElement(Instructions, { myState: 'pre-before-test', start: this.onNext });
		}
		if (this.state.myState == 'before-test') {
			inner = React.createElement(Test, { images: this.state.images, done: this.beforeTestDone });
		}
		if (this.state.myState == 'pre-prime') {
			inner = React.createElement(Instructions, { myState: 'pre-prime', start: this.onNext });
		}
		// prime
		if (this.state.myState == 'after-test') {
			inner = React.createElement(Test, { images: this.state.images, done: this.afterTestDone });
		}
		return React.createElement(
			'div',
			{ style: { width: '800px', height: '600px', background: 'white' } },
			inner
		);
	}
};


ReactDOM.render(React.createElement(VisualProcessingTest, { res: window.VPT_IMAGES }), document.getElementById('app'));