import React    from 'react';
import ReactDOM from 'react-dom';

import WatchPuppies from './watchPuppies.jsx';

let watchPuppies = <WatchPuppies
	source='earthporn'
	backgroundSize='cover'
	showHUD={true}
	trimTitle={true} />;

ReactDOM.render(watchPuppies, document.getElementById('pornStart'));

