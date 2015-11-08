

class Instructions extends React.Component {

	render(){
		var content = null;
		if(this.props.myState == 'beforeBlock-instructions'){
			content = <div>
				<p>This test consists of three parts.</p>
				<ol>
					<li>Test</li>
					<li>Priming</li>
					<li>Test</li>
				</ol>
				<p>
					This first test involves quick flashes of 10 black and white images, and asks you to answer a simple question. 
				</p>
				<p>
					Prepare to pay attention and click start.
				</p>
			</div>
		}
		if(this.props.myState == 'prime-instructions'){
			content = <div>
				<p>First test done.</p>
				<p>Next you will see the colour images which were used to generate the black and white images.</p>
				<p>Watch carefully, they will appear briefly, and without pause.</p>
			</div>
		}
		if(this.props.myState == 'afterBlock-instructions'){
			content = <div>
				<p>
					Once again, you will see quick flashes of 10 black and white images, and will be asked to answer a simple question. 
				</p>
				<p>
					Prepare to pay attention and click start.
				</p>
			</div>
		}

		return <div style={{ padding: '3em' }}>
			<h2>Instructions</h2>
			<div>
				{ content }
			</div>
			<a href="#" onClick={this.props.start} >Start</a>
		</div> 
	}
}