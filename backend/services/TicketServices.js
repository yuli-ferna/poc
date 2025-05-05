/**
* Ticket Service Module
* 
* This module provides services for managing tickets, including retrieving ticket history,
* saving new tickets, updating existing tickets, and deleting tickets. It interacts with
* various models such as User, Ticket, and Nyxcipher.
* 
* Functions:
* 
* 1. getTickets(email)
*    - Retrieves all tickets for a user identified by their email.
*    - Throws NotFoundError if the user or tickets are not found.
* 
* 2. getTicket(email, id)
*    - Retrieves a specific ticket by its ID for a user identified by their email.
*    - Throws NotFoundError if the user or ticket is not found.
* 
* 3. getTicketsForNyxcipher(email, id)
*    - Retrieves all tickets for a specific Nyxcipher item for a user identified by their email.
*    - Throws NotFoundError if the user or tickets are not found.
* 
* 4. saveTicket(email, body)
*    - Saves a new ticket for a user identified by their email.
*    - Throws NotFoundError if the user is not found.
* 
* 5. updateTicket(id, body)
*    - Updates an existing ticket identified by its ID.
*    - Throws NotFoundError if the ticket is not found.
* 
* 6. deleteTicket(id)
*    - Deletes a ticket identified by its ID.
*    - Throws NotFoundError if the ticket is not found.
* 
* Utility Functions:
* 
* - generateNumbers(length)
*   - Generates an array of random numbers of specified length.
* 
* Models:
* 
* - User: Represents a user in the system.
* - Ticket: Represents a ticket associated with a user.
* - Nyxcipher: Represents a Nyxcipher item associated with a ticket.
* 
* Errors:
* 
* - NotFoundError: Thrown when a requested resource is not found.
* - ValidationError: Thrown when validation of input data fails.
* - BadRequestError: Thrown when a bad request is made.
* 
* Example Usage:
* 
* const ticketService = require('./ticketService');
* 
* // Get all tickets for a user
* ticketService.getTickets('user@example.com')
*   .then(tickets => console.log(tickets))
*   .catch(err => console.error(err));
* 
* // Get a specific ticket
* ticketService.getTicket('user@example.com', ticketId)
*   .then(ticket => console.log(ticket))
*   .catch(err => console.error(err));
* 
* // Save a new ticket
* ticketService.saveTicket('user@example.com', ticketData)
*   .then(ticket => console.log(ticket))
*   .catch(err => console.error(err));
* 
* // Update a ticket
* ticketService.updateTicket(ticketId, updateData)
*   .then(updatedTicket => console.log(updatedTicket))
*   .catch(err => console.error(err));
* 
* // Delete a ticket
* ticketService.deleteTicket(ticketId)
*   .then(() => console.log('Ticket deleted'))
*   .catch(err => console.error(err));
*/                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      

const { NotFoundError, ValidationError, BadRequestError } = require('../utils/errors')
const Nyxcipher = require("../models/Nyxcipher")
const User = require("../models/User")
const Ticket = require("../models/Ticket")

exports.getTickets = async (email) => {
    const user = await User.findOne({email: email})
    console.log(user)
    if (!user) throw new NotFoundError('Account not found')

    let all_ticekts = await Ticket.find({buyer_id: user._id})
        .populate("nyxcipher_id")
        .populate("buyer_id")
        .populate("payment_id")
        .exec()

    if (!all_ticekts) throw new NotFoundError('Ticket not found')

    return all_ticekts
}

exports.getTicket = async (email, id) => {
    const user = await User.findOne({email: email})
    if (!user) throw new NotFoundError('Account not found')

    const ticket = await Ticket.findOne({_id: id, buyer_id: user._id})
    if (!ticket) throw new NotFoundError('Ticket not found')

    return ticket
}

exports.getTicketsForNyxcipher = async (email, id) => {
    const user = await User.findOne({email: email})
    if (!user) throw new NotFoundError('Account not found')

    let all_ticekts = await Ticket.find({buyer_id: user._id, nyxcipher_id: id})
        .populate("nyxcipher_id")
        .populate("buyer_id")
        .populate("payment_id")
        .exec()

    if (!all_ticekts) throw new NotFoundError('Ticket not found')

    return all_ticekts
}

exports.saveTicket = async (email, body) => {
    const user = await User.findOne({email: email})
    if (!user) throw new NotFoundError('Account not found')

    const ticket = new Ticket(body.ticket)
    ticket.buyer_id = user._id

    await ticket.save()
    return ticket
}

// *** WIP: working func *** //
exports.updateTicket = async (id, body) => {
    const {nyxcipher_id, ticket_count, payment_id, winning_ticket} = body
    let ticket = await Ticket.findById(id)

    if (!ticket) throw new NotFoundError('Ticket not found')
    let update_ticket = {
        ...ticket._doc,
        nyxcipher_id: nyxcipher_id ? nyxcipher_id : ticket._doc.nyxcipher_id,
        ticket_count: ticket_count ? ticket_count : ticket._doc.ticket_count,
        payment_id: payment_id ? payment_id : ticket._doc.payment_id,
        winning_ticket: winning_ticket ? winning_ticket : ticket._doc.winning_ticket,
    }

    console.log(update_ticket)
    await ticket.updateOne(update_ticket)

    return update_ticket
}

exports.deleteTicket = async (id) => {
    let nyxcipher = await Ticket.findById(id)
    if (!nyxcipher) throw new NotFoundError('Ticket not found')
    await nyxcipher.deleteOne()
	return true
}