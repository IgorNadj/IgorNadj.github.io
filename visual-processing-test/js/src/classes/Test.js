

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
		// TODO: randomise order
		console.log('next', answeredYes);

		var curIndex = this.state.currentImageIndex;

		var answers = this.state.answers;
		answers[curIndex] = answeredYes;
		this.setState({ answers: answers });

		var nextIndex = curIndex + 1;

		var numImages = Object.keys(this.state.images).length;

		// console.log('Test::next', this, this.state.images.length, nextIndex);
		if(nextIndex >= numImages){
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