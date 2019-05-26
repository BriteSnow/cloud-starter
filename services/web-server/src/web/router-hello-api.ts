import { srouter, success } from '../express-utils';
import { AppError, CommonErrorCode } from 'common/error'

/// Simplest example of an API. 
/// srouter is just a small async/await express router wrapper. 


const _router = srouter();


_router.get('/hello', async function (req, res) {

	const name = req.query.name;

	if (name) {
		// Note: `success` is a convenient method to return the success structure to the client `{success: true, data: ...}`
		return success({ name, message: `Hello ${name}!` });
	} else {
		// Note: The srouter small express router wrapper and start error handling, will manage throw exception. 
		//       AppError allows to have the code value. 
		throw new AppError(CommonErrorCode.INVALID_INPUT, "Parameter 'name' missing in the web request. Try `http://localhost:8080/api/hello?name=John` ");
	}

});


export const routerHelloAPI = _router;