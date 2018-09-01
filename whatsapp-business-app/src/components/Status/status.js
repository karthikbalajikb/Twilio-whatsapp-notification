import React from "react";

import "./status.scss";

const Status = (props) => (
  <div className="Status">
    <b>Status</b>
    <div className="Status__text"><div className={'Status__text--'+props.status}>{props.statusText}</div></div>
  </div>
);

export default Status;
