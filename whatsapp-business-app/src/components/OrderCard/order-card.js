import React from "react";

import Status from '../Status/status';
import ShopLogo from "../../assets/shop-logo.png";
import "./order-card.scss";

const OrderCard = (props) => (
  <article className="ordercard">
    <div className="ordercard__imgdiv">
      <img className="ordercard__img" src={ShopLogo} alt="shop logo" />
    </div>
    <div className="ordercard__desc">
      <p>40 inch Toshiba Smart TV</p>
      <p>2 Quantity</p>
      <p>2 x 25,000 INR = 50,000 INR</p>
    </div>
    <div className="ordercard__notification">
    <div>
      <button onClick={props.sendDispatchNotification}>Send Notification</button>
    </div>
      <Status statusText={props.statusText} status={props.status} />
    </div>
  </article>
);

export default OrderCard;
