import React, { useState } from 'react'
import './ProductRequestModal.css'

function ProductRequestModal({ selectedProduct, submitMessage, donorContact, isSubmitting, handleSubmit, closeModal, fetchProducts }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(donorContact)
            .then(() => {
                setCopied(true)
            })
    }

    if (!selectedProduct) return null

    return (
        <div className="pl-modal-overlay">
            <div className="pl-modal-container">
                <button className="pl-modal-close" onClick={closeModal}>×</button>

                <div className="pl-modal-header">
                    <h3>Solicitud de producto</h3>
                </div>

                <div className="pl-modal-body">
                    {!submitMessage ? (
                        // Primera etapa: confirmación de solicitud
                        <>
                            <p>Vas a solicitar el siguiente producto:</p>
                            <h4>{selectedProduct.title}</h4>
                            <p>{selectedProduct.description}</p>

                            <div className="pl-modal-actions">
                                <button type="button" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Enviando...' : 'Confirmar solicitud'}
                                </button>
                            </div>
                        </>
                    ) : (
                        // Segunda etapa: solicitud exitosa o error
                        <>
                            {submitMessage.type === 'success' ? (
                                <>
                                    <div className="pl-submit-message success">{submitMessage.text}</div>
                                    <div className="donor-contact-info">
                                        <p><strong>Este es el contacto del donante para que te comuniques con él:</strong></p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <p style={{ marginRight: '10px', wordBreak: 'break-all' }}>{donorContact}</p>
                                            <div className="copy-icon-wrapper" onClick={handleCopy} title="Copiar">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#007BFF" viewBox="0 0 24 24">
                                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {copied && <span style={{ color: 'green', marginTop: '8px' }}>¡Copiado!</span>}
                                    </div>
                                    <div className="pl-modal-actions">
                                        <button type="button" onClick={() => {
                                            closeModal();
                                            
                                        }}>
                                            Cerrar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="pl-submit-message error">{submitMessage.text}</div>
                                    <button onClick={closeModal}>Cerrar</button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductRequestModal
