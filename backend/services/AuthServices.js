/**
* User Authentication Service Module
* 
* This module provides services for user authentication, including login, registration,
* email verification, password reset, and forgot password functionality. It interacts with
* the User model and uses various utilities for error handling, encryption, and email sending.
* 
* Functions:
* 
* 1. verifyUserLogin(email, password)
*    - Verifies user login credentials.
*    - Throws NotFoundError if the user is not found.
*    - Throws ValidationError if the password is incorrect.
*    - Returns a JWT token if authentication is successful.
* 
* 2. login(body)
*    - Logs in a user with the provided email and password.
*    - Throws NotFoundError if the user is not found.
*    - Throws BadRequestError if the user is not verified.
*    - Throws ValidationError if the password is incorrect.
*    - Returns the user with a JWT token as the password.
* 
* 3. register(header, body)
*    - Registers a new user with the provided username, password, and email.
*    - Throws BadRequestError if the user already exists.
*    - Hashes the password and saves the user.
*    - Sends an email verification link to the user.
* 
* 4. verify(params)
*    - Verifies a user's email using a token.
*    - Throws UnauthorizedError if the token is missing, incorrect, or expired.
*    - Throws UnauthorizedError if the email is already verified.
*    - Marks the user as verified.
* 
* 5. reset(body)
*    - Resets a user's password with the provided email and new password.
*    - Throws NotFoundError if the user is not found.
*    - Hashes the new password and saves the user.
* 
* 6. forgot(req)
*    - Sends a password reset link to the user's email.
*    - Throws ValidationError if the email is not provided.
*    - Throws NotFoundError if the user is not found.
*    - Sends an email with the password reset link.
* 
* Utility Functions:
* 
* - generateNumbers(length)
*   - Generates an array of random numbers of specified length.
* 
* Models:
* 
* - User: Represents a user in the system.
* 
* Errors:
* 
* - NotFoundError: Thrown when a requested resource is not found.
* - ValidationError: Thrown when validation of input data fails.
* - UnauthorizedError: Thrown when authentication fails.
* - BadRequestError: Thrown when a bad request is made.
* - NotImplementedError: Thrown when a feature is not implemented.
* 
* Example Usage:
* 
* const authService = require('./authService');
* 
* // User login
* authService.login({ email: 'user@example.com', password: 'password123' })
*   .then(user => console.log(user))
*   .catch(err => console.error(err));
* 
* // User registration
* authService.register(req.headers, { username: 'newuser', email: 'newuser@example.com', password: 'password123' })
*   .then(user => console.log(user))
*   .catch(err => console.error(err));
* 
* // Email verification
* authService.verify({ token: 'verificationToken' })
*   .then(user => console.log(user))
*   .catch(err => console.error(err));
* 
* // Password reset
* authService.reset({ email: 'user@example.com', password: 'newpassword123' })
*   .then(user => console.log(user))
*   .catch(err => console.error(err));
* 
* // Forgot password
* authService.forgot(req)
*   .then(response => console.log(response))
*   .catch(err => console.error(err));
*/                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              

const User = require('../models/User')
const bcryptjs = require('bcryptjs')
const { UnauthorizedError, NotFoundError, ValidationError, NotImplementedError, BadRequestError } = require('../utils/errors')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const jwt = require('jsonwebtoken')
const {ROLE} = require('../config/constant')
const JWT_KEY = "jwtactive987"

// user login function
const verifyUserLogin = async (email,password)=>{
    try {
        const user = await User.findOne({email}).lean()
        if(!user) throw new NotFoundError('User not found')
        if(await bcryptjs.compare(password,user.password)){
            // creating a JWT token
            token = jwt.sign({email:user.email, role:user.role},JWT_KEY,{ expiresIn: '24h'})
            return {status:'ok', data:token}
        } else throw new ValidationError('Invalid password')
    } catch (error) {
        console.log(error);
        return {status:'error',error:'timed out'}
    }
}

exports.login = async (body) => {
	let { email, password } = body

	let user = await User.findOne({
		email: email,
	})

	if (!user) throw new NotFoundError('User not found')
    else if (!user.verified) throw new BadRequestError('User not verify')
	if (!(await bcryptjs.compare(password, user.password)))
        throw new ValidationError('Wrong password.')

    const response = await verifyUserLogin(email, password)
    if (response.status === 'ok') {
        user.password = response.data
        return user
    } else throw new ValidationError('Invalid password.')
}

exports.register = async (header, body) => {
	let { username, password, email } = body

	if (await User.exists({ username: username, email: email }))
        throw new BadRequestError('User already exist.')

	let hashedPass = await bcryptjs.hash(password, 10)
	// const emailVerificationCode = uid()

	let user = new User({
		username: username,
		password: hashedPass,
		email: email,
        role: ROLE.CUSTOMER,
	})

    await user.save()

    // Send Mail
    const oauth2Client = new OAuth2(
        "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
        "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
        "https://developers.google.com/oauthplayground" // Redirect URL
    );

    oauth2Client.setCredentials({
        refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
    });
    const accessToken = oauth2Client.getAccessToken()

    const token = jwt.sign({ username, email, password, role: ROLE.CUSTOMER }, JWT_KEY, { expiresIn: '24h' });
    const CLIENT_URL = 'http://' + header.host;

    console.log(token, CLIENT_URL)
    const output = `
    <h2>Please click on below link to activate your account</h2>
    <a href=${CLIENT_URL}/auth/verify/${token}>Verify Email</a>
    <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: "nodejsa@gmail.com",
            clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
            clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
            refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
            accessToken: accessToken
        },
    });

    // send mail with defined transport object
    const mailOptions = {
        from: '<nodejsa@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Account Verification: OASIS Nyxcipher Auth", // Subject line
        generateTextFromHTML: true,
        html: output, // html body
    };

    await transporter.sendMail(mailOptions)

	return user
}

exports.verify = async (params) => {
    const {token} = params
    if (!token)
        throw new UnauthorizedError('Email not verify! Please write password.')
    const decodeToken = jwt.verify(token, JWT_KEY)
    if (!decodeToken) throw new UnauthorizedError('Incorrect or expired link! Please register again.')

    const { email } = decodeToken
    let user = await User.findOne({ email: email })
    if (user.verified) throw new UnauthorizedError('Email already verified.')

    user.verified = true
    await user.save()
    return user
}

exports.reset = async (body) => {
	let { password, email } = body
	let user = await User.findOne({
		email: email,
	})

	if (!user) throw new NotFoundError('User already exist.')
	let hashedPass = await bcryptjs.hash(password, 10)
    user.password = hashedPass

    await user.save()

	return user
}

exports.forgot = async (req) => {

    const { email } = req.body;

    if (!email) throw new ValidationError('Please enter an email ID')

    let user = await User.findOne({ email: email })

    if (!user) throw new NotFoundError('User with Email ID does not exist!')

    const oauth2Client = new OAuth2(
        "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
        "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
        "https://developers.google.com/oauthplayground" // Redirect URL
    )

    oauth2Client.setCredentials({
        refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
    });
    const accessToken = oauth2Client.getAccessToken()

    const token = jwt.sign({ _id: user._id }, JWT_KEY, { expiresIn: '24h' });
    const CLIENT_URL = 'http://' + req.headers.host;
    const output = `
    <h2>Please click on below link to reset your account password</h2>
    <a href={${CLIENT_URL}/auth/forgot/${token}}>${CLIENT_URL}/auth/forgot/${token}</a>
    <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
    `;

    const updateUser = User.updateOne({ resetLink: token })
    if (!updateUser) throw new BadRequestError('Error resetting password!')

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: "nodejsa@gmail.com",
            clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
            clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
            refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
            accessToken: accessToken
        },
    });

    // send mail with defined transport object
    const mailOptions = {
        from: '"Auth Admin" <nodejsa@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Account Password Reset: OASIS Auth ✔", // Subject line
        html: output, // html body
    };

    const sendMail = transporter.sendMail(mailOptions)
    if (!sendMail) throw new NotImplementedError('Something went wrong on our end. Please try again later.')

    return sendMail
}