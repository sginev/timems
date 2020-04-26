import React from 'react';
import Form from 'react-bootstrap/Form';

type WorkHoursSliderProperties = {
  onChangeLive?:(value:number)=>void,
  onChangeDone?:(value:number)=>void,
  value:number
}

export const minimumDailyHoursToText = ( value:number ) => ! value ? 'Disabled' : (
  ( ~~value ) + " hours" + 
  ( 
    value % 1.0 === 0.0 ? '' :
    ( ' ' + ( value % 1.0 ) * 60 + ' minutes' ) 
  ) + ( value >= 16 ? ' (Get some sleep!)' : '' )
);

function MinimumDailyHoursSliderComponent( props:WorkHoursSliderProperties ) 
{
  const updateLive = ( value:number ) => {
    props.onChangeLive && props.onChangeLive( value );
  }

  const updateDone = ( value:number ) => {
    console.log( "Done!", value );
    props.onChangeDone && props.onChangeDone( value );
  }

  return ( 
    <Form.Group controlId="formBasicRangeCustom">
      <Form.Control
        onChange={ e => updateLive( parseFloat( e.target.value ) ) } 
        onPointerUp={ e => updateDone( parseFloat( e.target.value ) ) } 
        // onPointerUp 
        // onMouseUp={this.handleSubmit}
        value={ props.value || 0 }
        type="range" 
        min="0" 
        max="20"
        step=".5" 
        custom />
    </Form.Group>
  )
}

export default MinimumDailyHoursSliderComponent