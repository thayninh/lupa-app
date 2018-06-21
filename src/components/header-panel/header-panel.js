import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import CloudUpload from 'material-ui/svg-icons/file/cloud-upload'
import Explore from 'material-ui/svg-icons/action/explore'
import axios from 'axios';
import qs from 'qs';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
require('whatwg-fetch');
// import { FormattedMessage } from 'react-intl';
const customContentStyle = {
	width: '30%',
	maxWidth: 'none',
};
class HeaderPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = { selectedFile: null, uuid: null, open: false };
		this.upload_data_click = this.upload_data_click.bind(this);
		this.process_click = this.process_click.bind(this);
	}

	upload_data_click = event => {
		this.setState({ open: true });
		this.setState({ selectedFile: event.target.files[0] }, () => {
			const fd = new FormData();
			fd.append('userFile', this.state.selectedFile, this.state.selectedFile.name);
			axios.post('http://localhost:4000/upload', fd).then(res => {
				if (res.data.status === 'Sucessfully uploaded') {
					this.setState({ open: false });
					this.setState({ uuid: res.data.uuid }, () => {
						alert("Successfully uploaded");
					})
				} else if (res.data.status === 'Fail uploaded') {
					this.setState({ open: false }, () => {
						alert("Fail uploaded");
					});
				}
			}).catch(error => console.log(error));
		})
	}

	process_click = () => {
		this.setState({ open: true });
		
		const payload = JSON.stringify({ uuid: this.state.uuid })
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: payload,
			cors: true, // allow cross-origin HTTP request
			credentials: 'include' // This is similar to XHR’s withCredentials flag
		};

		fetch('http://localhost:4000/process', options)
			.then((response) => {
				return response.json();
			})
			.then((myJson) => {
				if(myJson.status === 'Sucessfully processed'){
					this.setState({open: false}, () => {
						alert("Sucessfully processed");
					});
				}else if(myJson.status === 'Fail processed'){
					this.setState({open: false}, () => {
						alert("Fail processed");
					});
				}else{
					this.setState({open: false}, () => {
						alert("Fail processed");
					});
				}
			})
			.catch((error) => {
				console.log(error)
			});

		// 	axios({
		// 		method:'post',
		// 		url:'http://localhost:4000/process',
		// 		data: qs.stringify({uuid: this.state.uuid})
		// 	  }).then(res => {
				// if(res.data.status === 'Sucessfully processed'){
				// 	this.setState({open: false}, () => {
				// 		alert("Sucessfully processed");
				// 	});
				// }else if(res.data.status === 'Fail processed'){
				// 	this.setState({open: false}, () => {
				// 		alert("Fail processed");
				// 	});
				// }else{
				// 	this.setState({open: false}, () => {
				// 		alert("Fail processed");
				// 	});
		// 		}
		// 	}).catch(error => console.log(error));;
	}

	render() {
		const styles = {
			appHeight: {
				height: 50
			},
			titleHeight: {
				height: 50,
				'line-height': 50
			}
		}

		const rightButtons = (
			<div>
				<RaisedButton label="Upload" icon={<CloudUpload />} secondary={true} containerElement="label">
					<input type="file" style={{ display: 'none' }} onChange={this.upload_data_click} />
				</RaisedButton>

				<RaisedButton label="Process" icon={<Explore />} secondary={true} style={{ marginLeft: 12 }} onClick={this.process_click}>
				</RaisedButton>
			</div>
		);
		return (
			<div>
				<AppBar title="Spatial Decision Support System For Land Use Planning Assessment"
					showMenuIconButton={false}
					iconElementRight={rightButtons}
					style={styles.appHeight}
					titleStyle={styles.titleHeight}
				/>
				<Dialog
					modal={true}
					open={this.state.open}
					contentStyle={customContentStyle}
				>
					<CircularProgress size={80} thickness={5} />
					Processing.........
        		</Dialog>
			</div >
		);
	}
}

export default HeaderPanel