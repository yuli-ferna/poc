/**
* Item Service Module
* 
* This module provides services for managing items, including retrieving items, saving new items,
* updating existing items, and deleting items. It interacts with the Item model and uses various
* utilities for error handling.
* 
* Functions:
* 
* 1. getItems(nyxciphers)
*    - Retrieves a list of item IDs from the provided Nyxcipher objects.
*    - Returns an array of item IDs.
* 
* 2. getItem(id)
*    - Retrieves a specific item by its ID.
*    - Throws NotFoundError if the item is not found.
*    - Returns the item.
* 
* 3. saveItem(body)
*    - Saves a new item with the provided details.
*    - Returns the saved item.
* 
* 4. updateItem(id, body)
*    - Updates an existing item identified by its ID with the provided details.
*    - Throws NotFoundError if the item is not found.
*    - Returns the updated item.
* 
* 5. deleteItem(id)
*    - Deletes an item identified by its ID.
*    - Throws NotFoundError if the item is not found.
*    - Returns true if the deletion is successful.
* 
* Models:
* 
* - Item: Represents an item in the system.
* 
* Errors:
* 
* - NotFoundError: Thrown when a requested resource is not found.
* - ValidationError: Thrown when validation of input data fails.
* - BadRequestError: Thrown when a bad request is made.
* 
* Example Usage:
* 
* const itemService = require('./itemService');
* 
* // Get items
* itemService.getItems(nyxciphers)
*   .then(items => console.log(items))
*   .catch(err => console.error(err));
* 
* // Get a specific item
* itemService.getItem(itemId)
*   .then(item => console.log(item))
*   .catch(err => console.error(err));
* 
* // Save a new item
* itemService.saveItem(itemData)
*   .then(item => console.log(item))
*   .catch(err => console.error(err));
* 
* // Update an item
* itemService.updateItem(itemId, updateData)
*   .then(updatedItem => console.log(updatedItem))
*   .catch(err => console.error(err));
* 
* // Delete an item
* itemService.deleteItem(itemId)
*   .then(() => console.log('Item deleted'))
*   .catch(err => console.error(err));
*/                                                                                                                                                                                                                                                                                                                              

const Item = require('../models/Item')
const { NotFoundError, ValidationError, BadRequestError } = require('../utils/errors')


exports.getItems = async (nyxciphers) => {
    let items = []
    nyxciphers.map(nyxcipher => items.push(nyxcipher.nyxcipher_item_id))
    console.log(items)
	return items
}

exports.getItem = async (id) => {
    console.log(id)
    const item = await Item.findById(id)
	return item
}

exports.saveItem = async (body) => {
    console.log(body)
    const {item_value, item_name, item_summary, highlights_list, item_specifications, item_features, item_thumbnail, item_images} = body.item

    let item = new Item({
        item_price: item_value,
        item_name: item_name,
        item_summary: item_summary,
        highlights_list: highlights_list,
        item_specifications: item_specifications,
        item_features: item_features,
        item_thumbnail: item_thumbnail,
        item_images: item_images,
    })

    await item.save()

	return item
}

exports.updateItem = async (id, body) => {
    const {item_value, item_name, item_summary, highlights_list, item_specifications, item_features, item_thumbnail, item_images} = body
    let item = await Item.findById(id)
    if (!item) throw new NotFoundError('Item not found')
    let update_item = {
        ...item._doc,
        item_price: item_value ? item_value:item._doc.item_price,
        item_name: item_name ? item_name:item._doc.item_name,
        item_summary: item_summary ? item_summary:item._doc.item_summary,
        highlights_list: highlights_list ? highlights_list:item._doc.highlights_list,
        item_specifications: item_specifications ? item_specifications:item._doc.item_specifications,
        item_features: item_features ? item_features:item._doc.item_features,
        item_thumbnail: item_thumbnail ? item_thumbnail:item._doc.item_thumbnail,
        item_images: item_images ? item_images:item._doc.item_images,
    }

    console.log(update_item)
    await item.updateOne(update_item)

    return update_item
}

exports.deleteItem = async (id) => {
    let item = await Item.findById(id)
    if (!item) throw new NotFoundError('Item not found')
    await item.deleteOne()
	return true
}
