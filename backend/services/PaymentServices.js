/**
* Payment Service Module
* 
* This module provides services for managing payments, including retrieving payment history,
* saving new payments, updating existing payments, and deleting payments. It interacts with
* various models such as User, Payment, Nyxcipher, Ticket, and Cart.
* 
* Functions:
* 
* 1. getPaymentsHistory(email)
*    - Retrieves the payment history for a user identified by their email.
*    - Throws NotFoundError if the user or payments are not found.
* 
* 2. getOnePaidPayment(email, id)
*    - Retrieves a specific payment by its ID for a user identified by their email.
*    - Throws NotFoundError if the user or payment is not found.
* 
* 3. savePayment(email, body)
*    - Saves a new payment for a user identified by their email.
*    - Throws NotFoundError if the user is not found.
*    - Throws ValidationError if the user's cart is empty.
* 
* 4. updatePayment(id, body)
*    - Updates an existing payment identified by its ID.
*    - Throws NotFoundError if the payment is not found.
* 
* 5. deletePayment(id)
*    - Deletes a payment identified by its ID.
*    - Throws NotFoundError if the payment is not found.
* 
* Utility Functions:
* 
* - generateNumbers(length)
*   - Generates an array of random numbers of specified length.
* 
* Models:
* 
* - User: Represents a user in the system.
* - Payment: Represents a payment made by a user.
* - Nyxcipher: Represents a Nyxcipher item associated with a payment.
* - Ticket: Represents a ticket associated with a payment.
* - Cart: Represents a user's shopping cart.
* 
* Errors:
* 
* - NotFoundError: Thrown when a requested resource is not found.
* - ValidationError: Thrown when validation of input data fails.
* - BadRequestError: Thrown when a bad request is made.
* 
* Example Usage:
* 
* const paymentService = require('./paymentService');
* 
* // Get payment history
* paymentService.getPaymentsHistory('user@example.com')
*   .then(history => console.log(history))
*   .catch(err => console.error(err));
* 
* // Save a new payment
* paymentService.savePayment('user@example.com', paymentData)
*   .then(payment => console.log(payment))
*   .catch(err => console.error(err));
* 
* // Update a payment
* paymentService.updatePayment(paymentId, updateData)
*   .then(updatedPayment => console.log(updatedPayment))
*   .catch(err => console.error(err));
* 
* // Delete a payment
* paymentService.deletePayment(paymentId)
*   .then(() => console.log('Payment deleted'))
*   .catch(err => console.error(err));
*/        

const { NotFoundError, ValidationError, BadRequestError } = require('../utils/errors')
const Nyxcipher = require("../models/Nyxcipher")
const User = require("../models/User")
const Payment = require("../models/Payment")
const Ticket = require("../models/Ticket")
const Cart = require("../models/Cart")

exports.getPaymentsHistory = async (email) => {
    const user = await User.findOne({email: email})
    if (!user) throw new NotFoundError('Account not found')

    let payment_histories = await Payment.find({buyer_id: user._id})
        .populate({
            path: 'nyxcipher_id',
            model: 'Nyxcipher',
            populate: {
                path: 'nyxcipher_item_id',
                model: 'Item'
            }
        })
        .populate('buyer_id')
        .populate('ticket_id')
        .sort({purchase_date: -1})
        .exec()
    if (!payment_histories) throw new NotFoundError('Payment not found')

    return payment_histories
}

exports.getOnePaidPayment = async (email, id) => {
    const user = await User.findOne({email: email})
    if (!user) throw new NotFoundError('Account not found')

    const payment = await Payment.findById(id)
    if (!payment) throw new NotFoundError('Payment not found')

    return payment
}

const generateNumbers = (length) => {
    let numbers = []
    for (let i = 0; i < length; i++) {
        const rnumb = Math.floor(Math.random() * (9999999 - 1000000) + 1000000);
        numbers.push(rnumb)
    }
    return numbers
}

exports.savePayment = async (email, body) => {
    const user = await User.findOne({email: email})
        .populate({
            path: "cart_entry",
            populate: [{
                path: "nyxcipher_id",
                model: "Nyxcipher",
                populate: {
                    path: "nyxcipher_item_id",
                    model: "Item",
                }
            }, {
                path: "ticket_id",
                model: "Ticket",
            }]
        }).exec()
    if (!user) throw new NotFoundError('Account not found')
    if (!user.cart_entry || user.cart_entry.length <= 0) throw new ValidationError('Cart is empty')

    let payments = []
    for (let i=0; i<user.cart_entry.length; i++) {
        const payment = new Payment({
            buyer_id: user._id,
            nyxcipher_id: user.cart_entry[i].nyxcipher_id, // nyxciphers joined with phurchased tickets
            ticket_id: user.cart_entry[i].ticket_id, // phurchased tickets
            purchase_date: new Date(),
            assigned_numbers: generateNumbers(user.cart_entry[i].ticket_id.ticket_count),
            amount_paid: user.cart_entry[i].ticket_id.ticket_price,
            payment_processor: body.payment_processor
        })
        await Cart.deleteOne({_id: user.cart_entry[i]._id})
        const saved_payment = await payment.save()
        payments.push(saved_payment)
        let ticket = await Ticket.findOne({_id: user.cart_entry[i].ticket_id})
        ticket.payment_id = saved_payment._id
        await ticket.save()
    }
    user.cart_entry = []
    await user.save()

    return payments
}

exports.updatePayment = async (id, body) => {
    const {nyxcipher_name, nyxcipher_category, nyxcipher_item_id, charity_recipient} = body
    let nyxcipher = await Ticket.findById(id)

    if (!nyxcipher) throw new NotFoundError('Ticket not found')
    let update_nyxcipher = {
        ...nyxcipher._doc,
        nyxcipher_name: nyxcipher_name ? nyxcipher_name : nyxcipher._doc.nyxcipher_name,
        nyxcipher_category: nyxcipher_category ? nyxcipher_category : nyxcipher._doc.nyxcipher_category,
        nyxcipher_item_id: nyxcipher_item_id ? nyxcipher_item_id : nyxcipher._doc.nyxcipher_item_id,
        charity_recipient: charity_recipient ? charity_recipient : nyxcipher._doc.charity_recipient,
    }

    console.log(update_nyxcipher)
    await nyxcipher.updateOne(update_nyxcipher)

    return update_nyxcipher
}

exports.deletePayment = async (id) => {
    let nyxcipher = await Ticket.findById(id)
    if (!nyxcipher) throw new NotFoundError('Ticket not found')
    await nyxcipher.deleteOne()
	return true
}
