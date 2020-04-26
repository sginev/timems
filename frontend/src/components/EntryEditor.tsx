import React, { useState } from 'react'

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import parseDuration from 'parse-duration'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { MyUserContext, User } from '../services/user';
import { Entry, millisecondsToDays, daysToMilliseconds } from '../services/entry';

import api from "../services/api"
import { AccessControl } from 'shared/authorization/AccessControl';

type EntryEditorProps = { state:EntryEditorState, changeState:React.Dispatch<EntryEditorState>, refresh:Function }
type EntryEditorState = { show:boolean, entry?:Entry }

const fieldsInitialValues = { 
  date : new Date(), 
  notes : '', 
  duration : ''
}

const makeFieldValues = ( entry:Entry ) => ({
  date : new Date( daysToMilliseconds( entry.day ) ),
  duration : entry.duration + 'h',
  notes : entry.notes,
})

const EntryEditorModalComponent = 
( { state : { show, entry }, changeState, refresh }:EntryEditorProps ) =>
{
  const myUser = React.useContext( MyUserContext ) as User;
  const [ fields, setFields ] = useState( entry ? makeFieldValues( entry ) : fieldsInitialValues )
  
  const access = new AccessControl( myUser );
  // const canEdit = myUser.id === entry.userId ?
  //                 access.update.own.entry :
  //                 access.update.any.entry;
  const canDelete = myUser.id === entry?.userId ?
                    access.delete.own.entry :
                    access.delete.any.entry;

  const onSubmit = e => {
    e.preventDefault();
    const path = '/entries' + ( entry ? '/' + entry.id : '' )
    const method = entry?.id ? 'post' : 'put';
    const data = {
      day: millisecondsToDays( fields.date.getTime() ) - 1,
      duration: parseDuration( fields.duration ) / 3600000,
      notes: fields.notes,
      userId: entry?.userId || myUser.id
    }

    setFields( fieldsInitialValues )
    changeState({ show : false })

    api.request( path, method, data )
      .then( () => refresh() )
      .catch( e => console.error( e ) ) 
  }

  const deleteEntry = e => {
    e.preventDefault();
    const path = '/entries/' + entry!.id
    const method = 'delete'

    setFields( fieldsInitialValues )
    changeState({ show : false })

    api.request( path, method )
      .then( () => refresh() )
      .catch( e => console.error( e ) ) 
  }

  return (
    <Modal show={ show } onHide={ () => changeState({ show : false }) }>
      <Form onSubmit={ onSubmit }>
          
        <Modal.Header closeButton>
          <Modal.Title>{ entry ? 'Update' : 'Create a new' } work record</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form.Group controlId="formCreateEntryDate">
            <Form.Label>Pick a date for your work entry</Form.Label>
            <DatePicker 
              className="form-control d-block"
              selected={ fields.date } 
              onChange={ date => setFields({ ...fields, date:date! }) } 
              placeholderText="Anytime" />
          </Form.Group>

          <Form.Group controlId="formCreateEntryNotes">
            <Form.Label>What did you work on?</Form.Label>
            <Form.Control 
              required 
              as="textarea" 
              rows="2"
              value={ fields.notes } 
              onChange={ e => setFields({ ...fields, notes: (e.target as HTMLInputElement).value }) } 
              placeholder="Provide some short notes on what you did" />
          </Form.Group>

          <Form.Group controlId="formCreateEntryDuration">
            <Form.Label>How long did you spend on it?</Form.Label>
            <Form.Control 
              required 
              type="text" 
              value={ fields.duration } 
              onChange={ e => setFields({ ...fields, duration:e.target.value }) } 
              placeholder="''1.5hr', '4 hours', '3h 20mins' are all acceptable values" />
          </Form.Group>

          <Form.Group controlId="formCreateEntryDate">
            <Form.Label>User</Form.Label>
            <Form.Control 
              required 
              disabled
              type="text" 
              value={ entry ? entry._username : myUser.username }
              placeholder="Provide some short notes on what you did" />
          </Form.Group>

        </Modal.Body>
        
        <Modal.Footer>
          { entry && canDelete && 
            <Button className="mr-auto" variant="secondary" onClick={ deleteEntry }>
              Delete
            </Button>
          }
          <Button variant="secondary" onClick={ () => changeState({ show:false }) }>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            { entry ? 'Update' : 'Add' } work record
          </Button>
        </Modal.Footer>

      </Form>
    </Modal>
  )
}

export default EntryEditorModalComponent