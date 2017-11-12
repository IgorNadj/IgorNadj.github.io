---
---

class Photos extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			photos: []
		}
	}

	componentDidMount(){
		const bucketPublicUrl = 'https://s3-ap-southeast-2.amazonaws.com/igornadj-photos/';
		const container = document.getElementById('photos');

		AWS.config.region = 'ap-southeast-2';
		const bucket = new AWS.S3({
		    params: {
		        Bucket: 'igornadj-photos'
		    }
		});
		bucket.makeUnauthenticatedRequest(
			'listObjects', 
			{}, 
			(err, data) => {
		        if (err) {
		            console.error(err);
		        } else {
		            let photoUrls = [];
		            data.Contents.forEach(function (obj) {
		                let photoUrl = bucketPublicUrl + obj.Key;
		                photoUrls.push(photoUrl);
		            });
		            this.setState({ photos: photoUrls });
		        }
		    }
		);
	}

	render() {
		return (
			<div>
				<p>hi...</p>
				{
					this.state.photos.map(photoUrl => {
						return <div key={photoUrl}>
							<img src={photoUrl} />
						</div>
					})
				}
			</div>
		);
	}
}