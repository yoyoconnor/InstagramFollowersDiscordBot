import PropTypes from 'prop-types';

AuthStatus.propTypes = {
    status: PropTypes.string
}

AuthStatus.defaultProps = {
    status: " "
}


export default function AuthStatus( { status } ) {

    if(status == 'good'){

        return (
            <>
                <div className="title-text">Authentication Successful!</div>
                <div className="sub-title-text">You may exit window</div>
            </> 
        )
    }
    else if (status == 'bad'){
        return (
            <>  
                <div className="title-text">Authentication Unsuccessful...</div>
                <div className="sub-title-text">Please try again</div>
            </>
        )
    }
    else {
        return (
        <>  
            <div className="title-text">Status Code Error</div>
            <div className="sub-title-text">Please check network status and try again</div>
        </>
        )
    }
}


