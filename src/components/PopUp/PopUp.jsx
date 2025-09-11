import PropTypes from "prop-types";
import { FaTriangleExclamation } from "react-icons/fa6";
import "./PopUp.css";

const PopUp = ({
  show,
  handleClose,
  titulo,
  bodyMessage,
  customButton,
  dialogClass = "",
  showFooter = true,
}) => {
  const modalStyle = show
    ? { display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }
    : { display: "none" };

  return (
    <div className="modal" style={modalStyle}>
      <div className={`modal-dialog modal-dialog-centered ${dialogClass}`}>
        <div className="modal-content border-0 modalCard">
          <div className="modal-header">
            <h5 className="modal-title titlePopUp">
              <strong>{titulo}</strong>{" "}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body justify-content-center text-center m-0 p-4 bodyMessage">
            <FaTriangleExclamation className="alertIcon" />
            {bodyMessage}
          </div>
          {showFooter && (
            <div className="modal-footer d-flex justify-content-evenly">
              {customButton && customButton}
              <button
                type="button"
                className="btn botonPopUp"
                onClick={handleClose}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

PopUp.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  titulo: PropTypes.string,
  bodyMessage: PropTypes.node,
  customButton: PropTypes.node,
  dialogClass: PropTypes.string,
  showFooter: PropTypes.bool,
};

export default PopUp;