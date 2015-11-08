

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