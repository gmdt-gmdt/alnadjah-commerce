import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../store/cartSlice";
import Completion from "./Completion";

export default function PaymentForm() {
  const { totalAmount } = useSelector((state) => state.cart);
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (!error) {
      try {
        const { id } = paymentMethod;
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount.toFixed(0), id }),
        };

        const response = await fetch(
          "http://localhost:5252/payment",
          requestOptions
        );
        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          dispatch(clearCart());
        }
      } catch (error) {
        console.log("Error", error);
        window.alert("🛑Sorry🛑, backend api not deployed ⛔💥");
      }
    } else {
      console.log(error.message);
    }
  };

  return (
    <div className="payment-container">
      {!success ? (
        <form onSubmit={handleSubmit}>
          <fieldset className="stripe-form-group">
            <div className="FormRow">
              <CardElement />
            </div>
          </fieldset>
          <button className="stripe-button">Pay</button>
        </form>
      ) : (
        <Completion />
      )}
    </div>
  );
}
