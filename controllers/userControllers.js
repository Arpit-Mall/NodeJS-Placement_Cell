const User = require('../models/userSchema');
const Student = require('../models/studentSchema');
const fs = require('fs');
const fastcsv = require('fast-csv');

// render sign up page
module.exports.signup = function (req, res) {
	if (req.isAuthenticated()) {
		return res.redirect('back');
	}
	res.render('signup');
};

// render sign in page
module.exports.signin = function (req, res) {
	if (req.isAuthenticated()) {
		return res.redirect('back');
	}
	res.render('signin');
};

// create session
module.exports.createSession = function (req, res) {
	req.flash('success', 'Logged-In successfully');
	return res.redirect('/');
};

// signout
module.exports.signout = function (req, res) {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
	});
	req.flash('success', 'You have logged out');
	console.log("logout successfully")
	return res.redirect('/users/signin');
};

// create user
module.exports.createUser = async function (req, res) {
	const { name, email, password, confirmPassword } = req.body;
	try {
		if (password !== confirmPassword) {
			req.flash('error', 'Password and Confirm Password does not match');
			return res.redirect('back');
		}
		const user = await User.findOne({ email });

		if (user) {
			req.flash('error', 'User exist already');
			return res.redirect('back');
		}

		const newUser = await User.create({
			name,
			email,
			password,
		});

		await newUser.save();

		if (!newUser) {
			req.flash('error', 'Error in creating user');
			console.log(`Error in creating user`);
			return res.redirect('back');
		}

		req.flash('success', 'User sign-up Successfully');
		return res.redirect('/users/signin');

	} catch (error) {
		// req.flash('error', `Error in creating user: ${error}`);
		console.log(`Error in creating user: ${error}`);
		res.redirect('back');
	}
};

// download report
module.exports.downloadCsv = async function (req, res) {
	try {
		const students = await Student.find({});

		let data = '';
		let no = 1;
		let csv = 'S.No, Name, Email, College, Placemnt, Contact Number, Batch, DSA Score, WebDev Score, React Score, Interview, Date, Result';

		for (let student of students) {
			data =
				no +
				',' +
				student.name +
				',' +
				student.email +
				',' +
				student.college +
				',' +
				student.placement +
				',' +
				student.contactNumber +
				',' +
				student.batch +
				',' +
				student.dsa +
				',' +
				student.webd +
				',' +
				student.react;

			if (student.interviews.length > 0) {
				for (let interview of student.interviews) {
					data += ',' + interview.company + ',' + interview.date.toString() + ',' + interview.result;
				}
			}
			no++;
			csv += '\n' + data;
		}

		const dataFile = fs.writeFile('report/data.csv', csv, function (error, data) {
			if (error) {
				console.log(error);
				return res.redirect('back');
			}
			// req.flash('success', 'Report generated successfully');
			// console.log('Report generated successfully');
			return res.download('report/data.csv');
		});
	} catch (error) {
		// req.flash('error', `Error in downloading file: ${error}`);
		console.log(`Error in downloading file: ${error}`);
		return res.redirect('back');
	}
};
