import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import CloudUpload from 'material-ui/svg-icons/file/cloud-upload'
import Explore from 'material-ui/svg-icons/action/explore'
import DataUsage from 'material-ui/svg-icons/device/data-usage'
import axios from 'axios';
import qs from 'qs';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import fileDownload from 'js-file-download';
require('whatwg-fetch');
// import { FormattedMessage } from 'react-intl';
const customContentStyle = {
	width: '30%',
	maxWidth: 'none',
};
const customResultStyle = {
	width: '90%',
	maxWidth: 'none',
};
class HeaderPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = { selectedFile: null, uuid: null, open: false, result: false, html_string: null, progress: 0, upload: false };
		this.upload_data_click = this.upload_data_click.bind(this);
		this.process_click = this.process_click.bind(this);
		this.result_click = this.result_click.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
	}

	upload_data_click = event => {
		this.setState({ upload: true });
		this.setState({ selectedFile: event.target.files[0] }, () => {
			const fd = new FormData();
			fd.append('userFile', this.state.selectedFile, this.state.selectedFile.name);
			axios.post('http://127.0.0.1:4000/upload', fd).then(res => {
				if (res.data.status === 'Sucessfully uploaded') {
					this.setState({ upload: false });
					this.setState({ uuid: res.data.uuid }, () => {
						alert("Successfully uploaded");
					})
				} else if (res.data.status === 'Fail uploaded') {
					this.setState({ upload: false }, () => {
						alert("Fail uploaded");
					});
				}
			}).catch(error => console.log(error));
		})
	}

	process_click = () => {
		this.setState({ open: true });
		axios({
			method: 'post',
			url: 'http://127.0.0.1:4000/process-lupa',
			data: qs.stringify({ uuid: this.state.uuid })
		}).then(res => {
			if (res.data.status === 'Sucessfully processed') {
				console.log("OK stage 1");
				axios({
					method: 'post',
					url: 'http://127.0.0.1:4000/process-lupa1',
					data: qs.stringify({ uuid: this.state.uuid })
				}).then(res => {
					if (res.data.status === 'Sucessfully processed') {
						console.log("OK stage 2");
						this.setState({ open: false }, () => {
							alert("Sucessfully processed");
						});
					} else if (res.data.status === 'Fail processed') {
						this.setState({ open: false }, () => {
							alert("Fail processed");
						});
					} else {
						this.setState({ open: false }, () => {
							alert("Fail processed");
						});
					}
				}).catch(error => console.log(error));
			} else if (res.data.status === 'Fail processed') {
				this.setState({ open: false }, () => {
					alert("Fail processed");
				});
			} else {
				this.setState({ open: false }, () => {
					alert("Fail processed");
				});
			}
		}).catch(error => console.log(error));
		
		for (let i = 1; i < 100; i++) {
			((i) => {
				setTimeout(() => {
					this.setState({ progress: i });
				}, i*1500);
			})(i);
		}
	}

	result_click = () => {
		this.setState({ result: true });
		axios({
			method: 'get',
			url: 'http://127.0.0.1:4000/report',
			params: { ID: this.state.uuid }
		}).then(res => {
			this.setState({ html_string: res.data });
		}).catch(error => console.log(error));
	}

	handleClose = () =>{
		this.setState({result: false});
	}

	handleDownload = () =>{
		axios({
			method: 'get',
			url: 'http://127.0.0.1:4000/report',
			params: { ID: this.state.uuid }
		}).then(res => {
			fileDownload(res.data, 'report.html');
		}).catch(error => console.log(error));
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

				<RaisedButton label="Result" icon={<DataUsage />} secondary={true} style={{ marginLeft: 12 }} onClick={this.result_click}>
				</RaisedButton>
			</div>
		);
		
		const actions = [
			<FlatButton
			  label="Close"
			  primary={true}
			  onClick={this.handleClose}
			/>,

			<FlatButton
			  label="Download"
			  primary={true}
			  onClick={this.handleDownload}
			/>,
		  ];
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
					contentStyle={customContentStyle}>
					<CircularProgress size={80} thickness={5} />
					Processing.........{this.state.progress}%
        		</Dialog>

				<Dialog
					modal={true}
					open={this.state.upload}
					contentStyle={customContentStyle}>
					<CircularProgress size={80} thickness={5} />
					Uploading.........
        		</Dialog>

				<Dialog
					actions={actions}
					modal={true}
					open={this.state.result}
					contentStyle={customResultStyle}>
					<div dangerouslySetInnerHTML={{ __html: this.state.html_string }} />
				</Dialog>
			</div >
		);
	}
}

export default HeaderPanel