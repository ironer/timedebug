<?php

define('DEBUG', TRUE); // debugging mode
define('ADVANCEDLOG', TRUE); // advanced logging & debugging features
define('LOCAL', TRUE); // allow runtime modification of logged and dumped variables (should be 'TRUE' just for local server)
define('NOW', microtime(TRUE)); // get start time of application
define('MEMORY', memory_get_usage()); // get current used memory
define('ROOT', dirname(__DIR__)); // get root directory on server
define('CACHE', __DIR__ . '/cache'); // cache for storing bigger changes sent by async AJAX's POST + hash in GET
define('EXAMPLES', __DIR__); // current directory just for testing of directory to path constant parsing



// autoload for composer dependencies
require_once(__DIR__ . '/../vendor/autoload.php');



/**
 * Connector class for TimeDebug library
 */
class td
{

	public $id = 'mapper'; // property 'id' is used for showing path in logged objects
	public $get;
	public $post;
	public $session;


	// create mappings for logged variables
	function __construct($testingArgument = NULL) {
		$this->get = &$_GET;
		$this->post = &$_POST;
		$this->session = &$_SESSION;
		self::lg('Creating mapper', $this);
	}


	// create connector for logging method
	public static function lg($text = '', $object = NULL, $reset = FALSE) {
		if (DEBUG) TimeDebug::lg($text, $object, $reset);
	}


	// create connector for dumping method
	public static function dump(&$arg0 = NULL, &$arg1 = NULL, &$arg2 = NULL, &$arg3 = NULL, &$arg4 = NULL, &$arg5 = NULL, &$arg6 = NULL, &$arg7 = NULL, &$arg8 = NULL, &$arg9 = NULL) {
		if (func_num_args() > 10) throw new Exception("Static method 'dump' accepts maximum of 10 argumens.");
		if (DEBUG) TimeDebug::dump();
	}

}



session_start();

if (DEBUG) { // initialize TimeDebug, if debug mode is on
	TimeDebug::init(
		CACHE,
		array(
			'advancedlog' => ADVANCEDLOG,
			'local' => LOCAL,
			'root' => ROOT,
			'starttime' => NOW,
			'pathconstants' => array('EXAMPLES'),
			'urllength' => 1000
		)
	);
}



$mapper = new td('useless argument');

$a = array(array('test string'));
$b = 'another string';
td::dump($a, $b);



if (DEBUG) {
	td::lg('Show TimeDebug', $mapper);

	echo '<hr>Generating of response: <b>' . TimeDebug::runtime() . '</b>'
			. ' / Max. memory: <b>' . TimeDebug::maxMem() . '</b> / Max. allocated: <b>' . TimeDebug::maxMem(TRUE) . '</b>'  . "\n";

	if (!ADVANCEDLOG) td::dump($mapper);

	echo "</div>\n</div>\n</div>\n</body>\n</html>";
} else {
	echo '<hr>Generating of response: <b>' . number_format((microtime(TRUE) - NOW) * 1000, 0, ',', ' ') . ' ms</b>'
			. ' / Max. memory: <b>' . number_format(memory_get_peak_usage() / 1024, 0, ',', ' ') . ' kB</b>'
			. ' / Max. allocated: <b>' . number_format(memory_get_peak_usage(TRUE) / 1024, 0, ',', ' ') . ' kB</b>' . "\n";
}
