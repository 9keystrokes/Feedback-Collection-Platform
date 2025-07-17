import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to form builder
    navigate('/form-builder', { replace: true });
  }, [navigate]);

  return null;
};

export default CreateForm;
