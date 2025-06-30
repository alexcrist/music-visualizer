import classnames from "classnames";
import styles from "./Card.module.css";

const Card = ({ className, children }) => {
  return (
    <div className={classnames(styles.container, className)}>{children}</div>
  );
};

export default Card;
