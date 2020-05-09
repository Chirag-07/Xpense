import React from 'react';
import firebase from "firebase/app";
import "firebase/storage";
import SignOutButton from './SignOut';
import '../App.css';
import ChangePassword from './ChangePassword';
import { AuthContext } from "../firebase/Auth";
import { useEffect, useContext, useState } from 'react';
import { getUser, updateProfilePic, updateAccountInfo, getAllColleges } from '../firebase/FirestoreFunctions';

//datepicker imports
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
	MuiPickersUtilsProvider,
	KeyboardTimePicker,
	KeyboardDatePicker,
} from '@material-ui/pickers';
//import for toggle button
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
//import for dropdown material ui
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { FormLabel } from 'react-bootstrap';
//import { stat } from 'fs-extra';



const defpic = require('../assets/default-avatar.png')

function Profile() {
	const { currentUser } = useContext(AuthContext);
	const [user, setUser] = useState();
	const [loading, setLoading] = useState(true);
	const [change, setChange] = useState(false);
	const [profPic, setProfPic] = useState();
	const [profPicUrl, setProfPicUrl] = useState();
	const [formSubmit, setFormSubmit] = useState(false);
	const [dob, setDob] = useState();
	const [currentStudent, setCurrentStudent] = useState(false);
	const [collegeList, setCollegeList] = useState();
	const [collegeSelected, setCollegeSelected] = useState();

	useEffect(() => {

		async function getData() {
			try {
				console.log("enter useeffect func")
				let u = await getUser(currentUser.uid);
				setLoading(false)
				setUser(u);
				console.log("fetched user details")
				let allColleges = await getAllColleges();
				setCollegeList(allColleges);
				console.log('fetched college list');
				console.log(allColleges);
			} catch (e) {
				console.log(e)
			}
		}
		getData();
	}, [currentUser, profPicUrl, formSubmit]);



	//onChange handler for input field of profile picture
	const handleChange = async (event) => {
		event.preventDefault();
		if (event.target.files[0]) {
			const profilePicture = event.target.files[0];
			setProfPic(profilePicture);
		}
	}

	//submit function for profile picture form
	const handleUpload = async (event) => {
		event.preventDefault();
		var metadata = {
			contentType: 'image/jpeg'
		};
		var storageRef = firebase.storage().ref();
		const storage = firebase.storage();
		//var profilePictureRef = storageRef.child(`images/${profPic.name}`).put(profPic, metadata);
		const uploadTask = storage.ref(`/profilePics/${profPic.name}`).put(profPic);
		console.log('img uploaded');

		// Listen for state changes, errors, and completion of the upload.
		uploadTask.on('state_changed',
			(snapShot) => {
				//takes a snap shot of the process as it is happening
				console.log(snapShot)
			}, (err) => {
				//catches the errors
				console.log(err)
			}, () => {
				// gets the functions from storage refences the image storage in firebase by the children
				// gets the download url then sets the image from firebase as the value for the imgUrl key:
				storage.ref('profilePics').child(profPic.name).getDownloadURL()
					.then(fireBaseUrl => {
						//setProfPicUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}))
						setProfPicUrl(fireBaseUrl);
						try {
							updateProfilePic(currentUser.uid, fireBaseUrl);
						} catch (error) {
							alert(error);
						}
						console.log('firebase url is' + fireBaseUrl);
					})

			})

	}

	//change handler for form input
	const handleDateChange = async (date) => {
		//event.preventDefault();
		setDob(date);

	}
	//change handler for toggle button
	const handleToggleChange = async (event) => {
		setCurrentStudent(!currentStudent);
	}
	//change handler for college list dropdown  button
	const handleDropdownChange = async (event) => {
		setCollegeSelected(event.target.value);
	}

	//function to update account details of the user
	const handleAccountUpdate = async (event) => {
		event.preventDefault();
		console.log('entering update acc func');
		//await updateAccountInfo(currentUser.uid,firstName,lastName);
		let { firstName, lastName, dob, collegeSelect } = event.target.elements;
		const first = firstName.value;
		const last = lastName.value;
		const dateOfBirth = dob.value;
		//let selectedCollegeId=collegeSelect.value;
		let selectedCollegeId;
		if(!currentStudent) {
			selectedCollegeId='';
		} else {
		 selectedCollegeId = collegeSelect.value
		}
		let status=currentStudent;
		//console.log(accountInfoForm)
		console.log("form data " + first + "  " + last + dateOfBirth + " " + selectedCollegeId + status);
		if (first && last) {
			try {
				await updateAccountInfo(currentUser.uid, first, last, dateOfBirth, selectedCollegeId,status);
				setFormSubmit(true);
			} catch (error) {
				alert(error);
			}
		} else alert('enter all info');

	};

	//component code
	if (!loading) {
		return (
			<div className="container">
				<a href="/university">TESTTSGG</a>
				<h2>Profile Page</h2>
				<div className="profile">
					{/* <img src={defaultPic} height="100" widht="100"/> */}
					{user && user.photoURL ? (<p>Profile Picture<img src={user.photoURL} alt='profilePic' height="100" width="100" /></p>) : (<p>Default Picture<br /><img src={defpic} alt='defaultpic' height="100" width="100" /></p>)}
					<form onSubmit={handleUpload}>
						<input type='file' onChange={handleChange} />
						<button style={{ border: '3px solid black' }}>Change profile picture</button>
					</form>
					{user ? (<p>First Name: {user.firstName}  <br />Last Name: {user.lastName}</p>) : (<p>NOT GETTING USER DATA</p>)}
					{user && user.posts ? (<div>MY POSTS: {user.posts.map((item) => {
						return (<div>
							<p>Post Details: {item.title} : {item.value}</p>
							<p>Post Description: {item.description}</p>
						</div>)
					})}</div>) : (<p>NOT GETTING any posts</p>)}
				</div>

				<h2>Edit account info</h2>
				<form id="accountInfoForm" name="accountInfoForm" onSubmit={handleAccountUpdate}>
					<label for="firstName">First Name:</label>
					<input required type="text" id="firstName" name="firstName" placeholder="Enter your first name" />
					<br></br>
					<label for="lastName">Last Name:</label>
					<input required type="text" id="lastName" name="lastName" placeholder="Enter your last name" />
					<br>
					</br>
					{/* material ui date picker for dob */}
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
						<Grid container justify="flex-start">
							<KeyboardDatePicker
								margin="normal"
								id="dob"
								name="dob"
								label="Enter date of birth"
								format="MM/dd/yyyy"
								value={dob}
								required
								onChange={handleDateChange}
								KeyboardButtonProps={{
									'aria-label': 'change date',
								}}
							/>
						</Grid>
					</MuiPickersUtilsProvider>




					{/*Todo: input field for college name if user is a current student */}

					{currentStudent ? (
						<div>
							<FormControl component="fieldset">
								<FormLabel component="legend">Are you a current student</FormLabel>

								<FormGroup row>
									<FormControlLabel
										control={<Switch checked={currentStudent} onChange={handleToggleChange} name="yes" />}
										label="Yes" labelPlacement="end"
									/>
								</FormGroup>
							</FormControl>

							<FormControl>
								<FormGroup  row>
								<InputLabel id="collegeListDropdown">Select your college</InputLabel>
								<Select
								style={{ width: '300px' }}
									labelId="collegeListDropdown"
									id="collegeSelect"
									name="collegeSelect"
									autoWidth="true"
									onChange={handleDropdownChange}
								>
									{collegeList && collegeList.map((item) => {
										return (
											<MenuItem value={item.id}>{item.name}</MenuItem>
										)
									})}
								</Select>
								</FormGroup>
							</FormControl>
						</div>
					) : (
							<FormControl component="fieldset">
								<FormLabel component="legend">Are you a current student</FormLabel>

								<FormGroup row>
									<FormControlLabel
										control={<Switch checked={currentStudent} onChange={handleToggleChange} name="yes" />}
										label="Yes" labelPlacement="end"
									/>
								</FormGroup>
							</FormControl>)}

					<br></br>
					<br></br>
					<button type='submit'>Apply changes</button>
				</form>
				
				<br></br>
				{change ? <div><ChangePassword /> <button onClick={() => setChange(!change)}>Hide</button></div> : <button onClick={() => setChange(!change)}>Click to Change Password</button>} <br />
				<SignOutButton />
			</div>
		);
	} else {
		return (
			<div>
				<p>Profile Loading...</p>
			</div>
		)
	}
}

export default Profile;
