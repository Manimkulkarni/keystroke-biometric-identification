from fastapi import HTTPException
from utils.logger import logger

def safe_predict(prediction_func, *args, **kwargs):
    """
    Wrap prediction functions with consistent error handling.
    
    Args:
        prediction_func: Function that performs prediction
        *args, **kwargs: Arguments to pass to prediction_func
        
    Returns:
        Prediction result
        
    Raises:
        HTTPException: With appropriate status code
    """
    try:
        result = prediction_func(*args, **kwargs)
        
        if isinstance(result, dict) and "error" in result:
            logger.warning(f"Prediction error: {result['error']}")
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")