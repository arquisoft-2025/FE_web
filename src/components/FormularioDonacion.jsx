import { useForm } from "react-hook-form";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function FormularioDonacion({ onVolver }) {
    // Configuración de react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm();
    // Estados del componente
  const [previewImage, setPreviewImage] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const imagenSeleccionada = watch("image");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setSubmitError('Solo se permiten archivos de imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('La imagen no debe exceder 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setSubmitError(null);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("condition", data.condition);
      formData.append("city", data.city);
      formData.append("email", data.email);
      formData.append("address", data.address);
      formData.append("expiration_date", data.expiration_date);
      formData.append("donor_name", data.donor_name);  // nuevo campo

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      const response = await fetch("http://localhost:5000/api/donations", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        setSubmitSuccess(true);
        reset();
        setPreviewImage(null);
        setTimeout(() => {
          onVolver();
        }, 2500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el servidor');
      }

    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setSubmitError(error.message || "Error al enviar la donación");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded shadow mt-5 bg-white" style={{ maxWidth: "700px", margin: "auto" }}>
      
      {submitError && (
        <div className="alert alert-danger mb-4">
          {submitError}
        </div>
      )}

      {/* NUEVO CAMPO - NOMBRE DEL DONANTE */}
      <div className="mb-3">
        <label className="form-label">Nombre del Donante <span className="text-danger">*</span></label>
        <input
          className={`form-control ${errors.donor_name ? 'is-invalid' : ''}`}
          {...register("donor_name", { required: "Este campo es obligatorio" })}
          placeholder="Ej: Juan Pérez"
          disabled={isSubmitting}
        />
        {errors.donor_name && <div className="invalid-feedback">{errors.donor_name.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Nombre del Producto <span className="text-danger">*</span></label>
        <input
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          {...register("title", { required: "Este campo es obligatorio" })}
          placeholder="Ej: Ropa de invierno"
          disabled={isSubmitting}
        />
        {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Descripción <span className="text-danger">*</span></label>
        <textarea
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          {...register("description", { required: "Este campo es obligatorio" })}
          placeholder="Describe brevemente la donación"
          rows="3"
          disabled={isSubmitting}
        />
        {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Categoría <span className="text-danger">*</span></label>
        <select
          className={`form-select ${errors.category ? 'is-invalid' : ''}`}
          {...register("category", { required: "Selecciona una categoría" })}
          disabled={isSubmitting}
        >
          <option value="">-- Selecciona --</option>
          <option value="Ropa">Ropa</option>
          <option value="Comida">Comida</option>
          <option value="Medicamentos">Medicamentos</option>
          <option value="Útiles escolares">Útiles escolares</option>
          <option value="Otros">Otros</option>
        </select>
        {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Condición <span className="text-danger">*</span></label>
        <select
          className={`form-select ${errors.condition ? 'is-invalid' : ''}`}
          {...register("condition", { required: "Selecciona el estado del producto" })}
          disabled={isSubmitting}
        >
          <option value="">-- Selecciona --</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Usado">Usado</option>
          <option value="No aplica">No aplica</option>
        </select>
        {errors.condition && <div className="invalid-feedback">{errors.condition.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Ciudad <span className="text-danger">*</span></label>
        <select
          className={`form-select ${errors.city ? 'is-invalid' : ''}`}
          {...register("city", { required: "Selecciona una ciudad" })}
          disabled={isSubmitting}
        >
          <option value="">-- Selecciona --</option>
          <option value="Bogotá">Bogotá</option>
          <option value="Medellín">Medellín</option>
          <option value="Cali">Cali</option>
          <option value="Barranquilla">Barranquilla</option>
          <option value="Cartagena">Cartagena</option>
          <option value="Otra">Otra</option>
        </select>
        {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Correo Electrónico <span className="text-danger">*</span></label>
        <input
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          type="email"
          {...register("email", { 
            required: "El correo es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Correo inválido"
            }
          })}
          placeholder="tucorreo@example.com"
          disabled={isSubmitting}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Dirección de Entrega <span className="text-danger">*</span></label>
        <input
          className={`form-control ${errors.address ? 'is-invalid' : ''}`}
          {...register("address", { required: "La dirección es obligatoria" })}
          placeholder="Dirección exacta"
          disabled={isSubmitting}
        />
        {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha de expiración de la publicación <span className="text-danger">*</span></label>
        <input
          type="date"
          className={`form-control ${errors.expiration_date ? 'is-invalid' : ''}`}
          {...register("expiration_date", { required: "Debes indicar una fecha de expiración" })}
          disabled={isSubmitting}
        />
        {errors.expiration_date && <div className="invalid-feedback">{errors.expiration_date.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Imagen (opcional)</label>
        <input
          type="file"
          accept="image/*"
          className={`form-control ${errors.image ? 'is-invalid' : ''}`}
          {...register("image")}
          onChange={handleImageChange}
          disabled={isSubmitting}
        />
        {errors.image && <div className="invalid-feedback">{errors.image.message}</div>}

        {previewImage && (
          <div className="mt-3 text-center">
            <p className="fw-bold">Vista previa:</p>
            <img src={previewImage} alt="Vista previa" className="img-thumbnail" style={{ maxHeight: "200px" }} />
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between">
        <button type="button" className="btn btn-outline-secondary" onClick={onVolver} disabled={isSubmitting}>
          Volver atrás
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Donación"}
        </button>
      </div>

      {/* Mensaje de éxito abajo */}
      {submitSuccess && (
        <div className="alert alert-success mt-4">
          ¡Gracias por tu donación! La información ha sido enviada correctamente.
        </div>
      )}
    </form>
  );
}

export default FormularioDonacion;

