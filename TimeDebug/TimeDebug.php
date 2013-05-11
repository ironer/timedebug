<?php

/**
 * Copyright (c) 2013 Stefan Fiedler & Michal Kovar
 * TimeDebug class for modeling, debugging and tuning of data structures in PHP
 * @author: Stefan Fiedler (http://ironer.cz)
 * Author of base PHP class 'Dumper': David Grudl (http://davidgrudl.com)
 */

// TODO: zkontrolovat dumpovani resources
// TODO: opravit editor:// linky na macbooku pro PHPStorm 6

class TimeDebug {

	const INIT_ADVANCED_LOG = 'advancedlog', // option for init() to trigger advanced logging (defaults to FALSE)
			INIT_LOCAL = 'local', // option for init() to trigger local server features (defaults to FALSE)
			INIT_ROOT = 'root', // absolute path to the root of web aplication (for path shortening to relative, defaults to '')
			INIT_START_TIME = 'starttime', // microtime of application start for calculations (defaults to microtime(TRUE))
			INIT_START_MEMORY = 'startmemory', // starting amount of used memory for calculation of used resources (defaults to 0)
			INIT_PATH_CONSTANTS = 'pathconstants', // array of constants containing absolute paths (e.g. CLASSES with value '/web/myapp/classes')
			INIT_GET = 'get', // option for init() with get variables for passing during debugging (defaults to &$_GET)
			INIT_POST = 'post', // option for init() with post variables for passing during debugging (defaults to &$_POST)
			INIT_MAX_URL_LENGTH = 'urllength', // maximum allowed length of URL for sending data, otherwise pre posting is used

			DEPTH = 'depth', // how many nested levels of array/object properties display (defaults to 8)
			TRUNCATE = 'truncate', // how truncate long strings? (defaults to 70)
			COLLAPSE = 'collapse', // always collapse? (defaults to false)
			COLLAPSE_COUNT = 'collapsecount', // how big array/object are collapsed? (defaults to 7)
			NO_BREAK = 'nobreak', // return dump without line breaks (defaults to false)
			APP_RECURSION = 'apprecursion', // force { RECURSION } on all nested objects with given self::$recClass
			PARENT_KEY = 'parentkey', // sets parent key for children's div to attribute 'data-pk' for arrays and objects
			DUMP_ID = 'dumpid', // id for .nd 'pre' in HTML form
			TDVIEW_INDEX = 'tdindex', // data-tdindex of .nd 'pre' in tdView
			TITLE_TYPE = 'titletype', // data for data-tt for titles (1: change, 2: method, defaults to 3: log, 4: method)
			TITLE_DATA = 'titledata'; // data for data-pk for titles


	private static $initialized = FALSE;
	private static $advancedLog;
	private static $local;
	private static $root;
	private static $startTime;
	private static $startMem;
	private static $lastRuntime;
	private static $lastMemory;
	private static $pathConsts = array();

	public static $recClass = 'App';

	public static $idPrefix = 'td';
	public static $idOnce = '';
	private static $idCounters = array('dumps' => array(), 'logs' => array(), 'titles' => array(), 'hashes' => array());

	private static $timeDebug = array();
	private static $timeDebugMD5 = array();

	public static $request = array();
	private static $cache = '';
	private static $get = array();
	private static $post = array();
	private static $maxUrlLength = 0;
	private static $varCounter = 0;

	public static $resources = array('stream' => 'stream_get_meta_data', 'stream-context' => 'stream_context_get_options', 'curl' => 'curl_getinfo');


	private static function prepareVarPath($id = NULL) {
		if ($id === NULL) return FALSE;

		if (empty(self::$request[$id]['varPath'])) {
			self::$request[$id]['error'] = "Pozadavek nema zadanou varPath.";
			return FALSE;
		}

		$varPath = &self::$request[$id]['varPath'];
		if (!is_array($varPath)) {
			self::$request[$id]['error'] = "Pozadavek nema varPath typu pole.";
			return FALSE;
		}

		foreach ($varPath as &$key) {
			if (empty($key)) {
				self::$request[$id]['error'] = "Krok cesty nema uveden typ ani klic.";
				return FALSE;
			}

			$retStep = array();
			if ($key[0] === '*') {
				$retStep['priv'] = 2;
				$key = substr($key, 1);
			} else if ($key[0] === '#') {
				$retStep['priv'] = 1;
				$key = substr($key, 1);
			}

			$retStep['step'] = intval($key[0]);
			if ($retStep['step'] < 1) {
				self::$request[$id]['error'] = "Krok cesty ma chybny typ klice: $key[1].";
				return FALSE;
			}

			if ($retStep['step'] !== 2) {
				$retStep['key'] = substr($key, 1);
				if ($retStep['key'] === FALSE ) {
					self::$request[$id]['error'] = "Krok cesty ma prazdny nazev property nebo klic ve varPath.";
					return FALSE;
				}
			}

			$key = $retStep;

			if (self::$request[$id]['type'] === 2) {
				if (in_array($retStep['step'], array(2, 4, 6))) $unsetArray = &$key;
				else if (isset($unsetArray) && $retStep['step'] > 6) $unsetArray['unset'] = 1;
				else unset($unsetArray);
			}
		} unset($key);
		return TRUE;
	}

	public static function init($cache = '', array $options = NULL) {
		if (self::$initialized) throw new Exception("Trida TimeDebug uz byla inicializovana drive.");
		$options = (array) $options + array(
			self::INIT_ADVANCED_LOG => FALSE,
			self::INIT_LOCAL => FALSE,
			self::INIT_ROOT => '',
			self::INIT_START_TIME => microtime(TRUE),
			self::INIT_START_MEMORY => 0,
			self::INIT_PATH_CONSTANTS => array(),
			self::INIT_GET => &$_GET,
			self::INIT_POST => &$_POST,
			self::INIT_MAX_URL_LENGTH => 1000
		);

		self::$advancedLog = !!($options[self::INIT_ADVANCED_LOG]);
		self::$local = !!($options[self::INIT_LOCAL]);
		self::$root = $options[self::INIT_ROOT];
		self::$lastRuntime = self::$startTime = $options[self::INIT_START_TIME];
		self::$lastMemory = self::$startMem = $options[self::INIT_START_MEMORY];
		foreach ($options[self::INIT_PATH_CONSTANTS] as $const) {
			self::$pathConsts['#^' . preg_quote(substr(constant($const), strlen(self::$root)), '#') . '#'] = $const;
		}
		self::$get = &$options[self::INIT_GET];
		self::$post = &$options[self::INIT_POST];
		self::$maxUrlLength = max(intval($options[self::INIT_MAX_URL_LENGTH]), 0);
		self::$initialized = TRUE;

		if (isset($options[self::INIT_POST]['tdcache'])) $throwError = function($text) { echo 0 . $text; die; };
		else {
			$throwError = function($text) { throw new Exception($text); };
			if (self::$advancedLog) register_shutdown_function(array(__CLASS__, '_closeDebug'));
		}

		if (!is_dir($cache)) $throwError("Adresar '" . substr($cache, strlen(self::$root)) . "' pro odkladani dat neexistuje.");
		if (!is_writable($cache)) $throwError("Do adresare '" . substr($cache, strlen(self::$root)) . "' pro odkladani dat nelze zapisovat.");

		self::$cache = $cache . '/timedebug/';
		if (is_dir(self::$cache)) {
			if (!is_writable(self::$cache)) $throwError("Do adresare '" . substr(self::$cache, strlen(self::$root), -1) . "' nelze zapisovat.");
		} else {
			mkdir(self::$cache);
			chmod(self::$cache, 0777);
		}

		if (isset($options[self::INIT_POST]['tdcache'])) {
			if (!file_exists(self::$cache . ($reqMd5 = md5($options[self::INIT_POST]['tdcache'])))) {
				file_put_contents(self::$cache . $reqMd5, Base62Shrink::decompress($options[self::INIT_POST]['tdcache']));
			}
			echo 1 . $reqMd5;
			die;
		} elseif (isset($options[self::INIT_GET]['tdhash'])) {
			if (!file_exists($fileChanges = self::$cache . $options[self::INIT_GET]['tdhash'])) {
				throw new Exception("Soubor obsahujici zmeny '" . substr($fileChanges, strlen(self::$root))
						. "' nelze najit v cache.");
			}
			self::$request = json_decode(file_get_contents($fileChanges), TRUE);
			unset($options[self::INIT_GET]['tdhash']);
		} elseif (isset($options[self::INIT_GET]['tdrequest'])) {
			self::$request = json_decode(Base62Shrink::decompress($options[self::INIT_GET]['tdrequest']), TRUE);
			unset($options[self::INIT_GET]['tdrequest']);
		} elseif (isset($options[self::INIT_POST]['tdrequest'])) {
			self::$request = json_decode(Base62Shrink::decompress($options[self::INIT_POST]['tdrequest']), TRUE);
			unset($options[self::INIT_POST]['tdrequest']);
		}

		header('Content-type: text/html; charset=utf-8');
		header("Cache-control: private");
		echo "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>TimeDebug</title>\n<style>\n";
		readfile(__DIR__ . '/timedebug.css');
		echo "\n</style></head>\n<body>\n<div id=\"logContainer\">\n<div id=\"logWrapper\">\n<div id=\"logView\">\n";

		if (self::$request) {
			self::$request['count'] = count(self::$request);
			self::$request['dumps'] = array();
			self::$request['logs'] = array();
			for ($i = 0; $i < self::$request['count']; ++$i) {
				self::$request[$i]['path'] = self::$request[$i][0];
				self::$request[$i]['value'] = self::$request[$i][1];
				self::$request[$i]['type'] = self::$request[$i][2];
				self::$request[$i]['fullHeight'] = self::$request[$i][3];
				unset(self::$request[$i][0], self::$request[$i][1], self::$request[$i][2], self::$request[$i][3]);
				$path = explode(',', self::$request[$i]['path']);
				if ($path[0] === 'dump') {
					self::$request[$i]['varPath'] = array_slice($path, 2);
					if (!self::prepareVarPath($i)) {
						echo '<pre class="nd-error"> Chyba pozadavku na zmenu v dumpu ' . $path[1] . ': '
								. self::$request[$i]['error'] . ' </pre>';
						continue;
					}
					if (isset(self::$request['dumps'][$path[1]])) self::$request['dumps'][$path[1]][] = $i;
					else self::$request['dumps'][$path[1]] = array($i);
				} elseif ($path[0] === 'log') {
					self::$request[$i]['varPath'] = array_slice($path, 3);
					if (!self::prepareVarPath($i)) {
						echo '<pre class="nd-error"> Chyba pozadavku na zmenu v logu ' . $path[1] . '(' . $path[2] . '): '
								. self::$request[$i]['error'] . ' </pre>';
						continue;
					}
					if (isset(self::$request['logs'][$path[1]])) {
						if (isset(self::$request['logs'][$path[1]][$path[2]])) {
							self::$request['logs'][$path[1]][$path[2]][] = $i;
						} else self::$request['logs'][$path[1]][$path[2]] = array($i);
					} else self::$request['logs'][$path[1]] = array($path[2] => array($i));
				}
			}
		}
	}


	public static function _closeDebug() {
		$tdHelp = array(
			'OVLADANI LOGU' => array(
				'↑' => 'posun na predchozi (oznaceny) log',
				'↓' => 'posun na nasledujici (oznaceny) log',
				'Left Click' => 'vyber logu',
				'Ctrl/Cmd + LC' => 'oznaceni/odznaceni logu',
				'Shift + LC' => 'oznaceni/odznaceni rozsahu logu'
			),
			'OVLADANI TITULKU' => array(
				'MouseWheel Up' => 'skrolovani nahoru',
				'MouseWheel Down' => 'skrolovani dolu',
				'Left Click' => 'prispendlit/odspendlit titulek',
				'Alt + LC' => 'presunout titulek',
				'Ctrl/Cmd + LC' => 'zmenit velikost titulku',
				'Ctrl/Cmd + Alt + LC' => 'vychozi velikost titulku',
				'Shift + Alt + LC' => 'zavrit titulek (s podtitulky)',
				'klavesa Esc' => 'zavrit a resetovat vsechny titulky',
				'klavesa Space' => 'prepnout rezim zobrazeni titulku'
			),
			'OVLADANI HVEZDICKY' => array(
				'Alt + LC' => 'zmena velikosti oken',
				'Shift + LC' => 'maximalizovany rezim'
			),
			'OVLADANI MENU (pouze local)' => array(
				'Shift + "odeslat"' => 'odeslat zmeny do noveho okna',
				'Ctrl/Cmd + "odeslat"' => 'vynutit odeslani POSTem',
				'Shift + "obnovit"' => 'obnovit stranku do noveho okna',
				'Ctrl/Cmd + "obnovit"' => 'obnovit a zapomenout POST'
			),
			'EDITACE PROMENNYCH (pouze local)' => array(
				'Right Click' => 'otevrit modal konzoli pro zadani',
				'Alt + RC' => 'unsetovat prvek pole s danym indexem',
				'RC na masku' => 'zavrit konzoli, pokud je beze zmen'
			),
			'ROZSIROVANI POLI (pouze local)' => array(
				'Alt + Right Click' => 'otevrit konzoli pro zadani',
			),
			'OVLADANI KONZOLE (pouze local)' => array(
				'klavesa Enter' => 'v konzoli dalsi radek',
				'Shift + Enter' => 'ulozit zmeny a zavrit konzoli',
				'klavesa Esc' => 'zavrit konzoli bez ulozeni',
				'Ctrl/Cmd + B' => 'vybrat aktualni blok v promenne',
				'Ctrl/Cmd + D' => 'duplikovat vyber / radek / radky',
				'Ctrl/Cmd + Y' => 'vymazat aktualni / vybrane radky',
				'\'"' => 'obalit vyber/zmenit obaleni uvozovkami',
				'()[]{}' => 'obalit vyber danym typem zavorek',
				'Ctrl/Cmd + Alt + LC' => 'vychozi velikost konzole',
				'Ctrl/Cmd + Shift + LC' => 'oprava a format JSONu'
			),
			'UPRAVA ZADANYCH ZMEN (pouze local)' => array(
				'Left Click' => 'naskrolovat na vybranou zmenu',
				'Right Click' => 'otevrit modal konzoli pro upravu',
				'Alt + RC' => 'unsetovat prvek pole s danym indexem',
				'LC na krizek' => 'vypnout automaticke prepinani logu',
				'Alt + RC na krizek' => 'smazat vybranou zmenu',
				'Shift + LC' => 'prijmout opravu / formatovat JSON'
			),
			'OVLADANI VYSLEDKU ZMEN (pouze local)' => array(
				'Alt + Left Click' => 'prepnout 1 radkovy / plna vyska',
				'Alt + Space' => 'prepnout rezim zobrazeni vysledku',
				'Right Click' => 'otevrit modal konzoli pro upravu'
			)
		);

		echo "\n<script>\n";
		readfile(__DIR__ . '/jak.packer.js');
		echo "\n";
		readfile(__DIR__ . '/b62s.packer.js');
		echo "\n";
		readfile(__DIR__ . '/timedebug.js');
		echo "\ntd.local = " . (self::$local ? 'true' : 'false') . ";\n"
				. "td.indexes = " . json_encode(self::$timeDebug) . ";\n"
				. "td.get = " . json_encode(self::getGetText()) . ";\n"
				. "td.post = " . json_encode(self::getPostArray()) . ";\n"
				. "td.maxUrlLength = " . intval(self::$maxUrlLength) . ";\n"
				. "td.response = " . json_encode(self::getResponse()) . ";\n"
				. "td.help = " . (!empty($tdHelp) ? json_encode(trim(self::toHtml($tdHelp))): "''") . ";\n"
				. "td.init(1);\n</script>\n";
	}


	private static function getPathHash($text = '') {
		$consted = preg_replace(array_keys(self::$pathConsts), self::$pathConsts, $text, 1);
		$retMD5 = md5(self::$idPrefix . '|' . self::$idOnce . '|' . $consted);
		self::$idOnce = '';
		return $retMD5 . dechex(self::incCounter($retMD5));
	}

	public static function lg($text = '', $object = NULL, $reset = FALSE) {
		if (!self::$initialized) throw new Exception("Trida TimeDebug nebyla inicializovana statickou metodou 'init'.");
		$retChanges = '';

		list($file, $line, $code, $place) = self::findLocation(TRUE);
		$relative = substr($file, strlen(self::$root));

		if ($reset) {
			self::$lastRuntime = self::$startTime;
			self::$lastMemory = self::$startMem;
		}

		$textOut = $text = htmlspecialchars($text);

		if (is_object($object)) {
			$objects = array($object);
			$path = isset($object->id) ? array($object->id) : array();

			while (isset($object->container)) {
				array_unshift($objects, $object = $object->container);
				if (isset($object->id)) $path[] = $object->id;
			}

			$textOut = ($path ? '<span class="nd-path">' . ($path = htmlspecialchars(implode('/', array_reverse($path)))) . '</span> ' : '') . $text;
		}

		if (self::$advancedLog && isset($objects)) {
			$logId = 'l' . self::$idPrefix . '_' . self::incCounter('logs');
			$logHash = self::getPathHash("$relative|l|$place");

			$dumpVars = array(); $i = 0;
			foreach($objects as $curObj) {
				if (isset(self::$request['logs'][$logHash][$i])) $retChanges .= self::updateVar($curObj, self::$request['logs'][$logHash][$i], $logHash);
				$dumpVars[] = self::toHtml($curObj, array(self::TDVIEW_INDEX => $i++));
			}
			$dump = implode('<hr>', $dumpVars);
			$dumpMD5 = md5($dump);
			if (isset(self::$timeDebugMD5[$dumpMD5])) {
				self::$timeDebug[] = self::$timeDebugMD5[$dumpMD5];
			} else {
				self::$timeDebug[] = self::$timeDebugMD5[$dumpMD5] = $cnt = count(self::$timeDebugMD5);
				echo '<pre id="tdView_' . ++$cnt . '" class="nd-view-dump">' . $dump . '</pre>';
			}
			$tdParams = ' data-hash="' . $logHash . '" id="' . $logId . '" class="nd-row nd-log"';
		} else $tdParams = ' class="nd-row"';

		echo "<pre" . ($object === NULL ? '' : " data-runtime=\"" . number_format(1000*(microtime(TRUE)-self::$startTime),2,'.','')
				. "\" data-title=\"" . (empty($path) ? '' : "$path> ") . "$text\"") . "$tdParams>["
				. str_pad(self::runtime(self::$lastRuntime), 8, ' ', STR_PAD_LEFT) . ' / '
				. str_pad(self::memory(self::$lastMemory), 8, ' ', STR_PAD_LEFT) . ']' . " $textOut [<small>";

		if (self::$local) {
			echo '<a href="editor://open/?file=' . rawurlencode($file) . "&line=$line"
					. "\" class=\"nd-editor\"><i>" . htmlspecialchars($relative) . "</i> <b>@$line</b></a>";
		} else {
			echo "<span class=\"nd-editor\"><i>" . htmlspecialchars($relative) . "</i> <b>@$line</b></span>";
		}

		echo ($code ? " $code" : '') . '</small>]</pre>' . $retChanges;
	}


	public static function dump(&$arg0 = NULL, &$arg1 = NULL, &$arg2 = NULL, &$arg3 = NULL, &$arg4 = NULL, &$arg5 = NULL, &$arg6 = NULL, &$arg7 = NULL, &$arg8 = NULL, &$arg9 = NULL) {

		if (!self::$initialized) throw new Exception("Trida TimeDebug nebyla inicializovana statickou metodou 'init'.");
		if (func_num_args() > 10) throw new Exception("Staticka metoda 'dump' muze prijmout nejvyse 10 argumentu.");

		$callbackIndex = (func_num_args() === 0) ? 1 : 0;
		$backtrace = debug_backtrace(FALSE);

		list($file, $line, $code, $place) = self::findLocation();
		$relative = substr($file, strlen(self::$root));

		echo '<hr>' . ($file ? '<pre class="nd-location"><b>Dump</b> in <' . (self::$local ? 'a href="editor://open/?file='
		. rawurlencode($file) . "&amp;line=$line\"" : 'span') . " class=\"nd-editor\"><i>"
		. htmlspecialchars($relative) . "</i> <b>@$line</b></a> $code</pre>" : '');

		$j = 0;
		if (isset($backtrace[$callbackIndex]["args"][0])) {
			$j = count($backtrace[$callbackIndex]["args"]);
		} else echo '<hr>';

		for ($i = 0; $i < $j; ++$i) {
			$var = &$backtrace[$callbackIndex]["args"][$i];
			if (self::$advancedLog) {
				$dumpId = 'd' . self::$idPrefix . '_' . self::incCounter('dumps');
				$dumpHash = self::getPathHash("$relative|d|$place");

				if (isset(self::$request['dumps'][$dumpHash])) echo self::updateVar($var, self::$request['dumps'][$dumpHash], $dumpHash);

				$options = array(self::DUMP_ID => $dumpId, self::TITLE_TYPE => 4);
			} else {
				$dumpHash = '';
				$options = array(self::TITLE_TYPE => 4);
			}

			echo self::toHtml($var, $options, $dumpHash);
			echo '<hr>';
		} unset($var);
	}


	private static function updateVar(&$var = NULL, array &$changes = NULL, $hash = '') {
		if (!$hash) $hash = md5(self::$idPrefix);
		$retText = '';

		for ($i = 0, $j = count($changes); $i < $j; ++$i) {
			$change = &self::$request[$changes[$i]];
			$change['resId'] = 'tdchres_' . ++self::$varCounter;
			try {
				$applied = self::applyChange($var, $change['varPath'], $change['value'], $change['resId'], $change['type'], $hash);
				$change['res'] = $applied[0];
				$change['oriVar'] = '<span id="t' . self::$idPrefix . '_' . self::incCounter()
						. '" class="nd-title" data-tt="1"><strong class="nd-inner"><pre class="nd">' . $applied[1] . '</pre></strong></span>';
				$retText .= $applied[2];
			} catch(Exception $e) {
				$retText .= '<pre id="' . $change['resId'] . '" class="nd-result nd-error"><div class="nd-rollover"><div class="nd-indenter">'
						. ' Chyba pri modifikaci promenne na hodnotu ' . json_encode($change['value'])
						. ' (' . gettype($change['value']) . '): ' . $e->getMessage() . ' </div></div></pre>';
				$change['res'] = $e->getCode();
			}
			unset($change['varPath']);
		}
		return $retText;
	}


	private static function applyChange(&$var = NULL, $varPath = array(), &$value = NULL, &$name = NULL, &$type = 0, &$hash = '') {
		if (empty($varPath) || !is_array($varPath)) throw new Exception('Neni nastavena neprazdna cesta typu pole (nalezen typ '
				. gettype($varPath) . ') pro zmenu v promenne typu ' . gettype($var), 7);

		$step = $varPath[0]['step'];
		$priv = isset($varPath[0]['priv']) ? $varPath[0]['priv'] : 0;
		$retText = '';
		$retVal = array();

		if ($priv) {
			$fields = (array) $var;
			$varArray = array();
			foreach ($fields as $k => &$v) $varArray[$k[0] === "\x00" ? substr($k, strrpos($k, "\x00") + 1) : $k] = $v;
		}

		if ($step >= 7)  {
			if ($type % 2 && !is_array($var)) throw new Exception('Promenna typu ' . gettype($var) . ', ocekavano pole pro pridani prvku.', 9);
			$retText .= '<pre' . ( $name ? ' id="' . $name . '"' : '') . ' class="nd-result ';

			$oriVar = $var;
			$values = $type === 3 ? json_decode($value) : (is_array($value) ? $value : array($value));
			$changed = FALSE;
			$overwrite = FALSE;

			if ($type % 2) {
				foreach ($values as $key => $val) {
					if ($type === 1) $var[] = $val;
					else {
						if (isset($var[$key])) $overwrite = TRUE;
						$var[$key] = $val;
					}
				}
				if ($overwrite) $retText .= 'nd-array-overwrite">';
				else $retText .= 'nd-array-add">';
			} elseif($type) {

			} elseif($var !== $value) {
				$var = $value;
				$retText .= 'nd-ok">';
				$changed = TRUE;
			} else $retText .= 'nd-equal">';

			$retText .= '<div class="nd-rollover"><div class="nd-indenter">';

			if ($step === 7) $retText .= ' Chranena property "' . $varPath[0]['key'] . '":';
			elseif ($step === 8) $retText .= ' Klic/property "' . $varPath[0]['key'] . '":';

			if ($type % 2) {
				if ($overwrite) {
					$retVal[0] = 5;
					$retText .= ' Upraveno';
				} else {
					$retVal[0] = 3;
					$retText .= ' Doplneno';
				}

				if ($oriVar === $var) ++$retVal[0];
				$retText .= ' pole ' . json_encode($oriVar) . ' polem ' . ($type === 2 ? $value : json_encode($values)) . '. ';
			} elseif ($type) {
				throw new Exception('Nepovedlo se odebrani prvku z pole na indexu "' . $varPath[0]['key'] . '".', 9);
			} elseif ($changed) {
				$retVal[0] = 1;
				$retText .= ' Zmena z ' . json_encode($oriVar) . ' (' . gettype($oriVar) . ') na ' . json_encode($var) . ' (' . gettype($var) . '). ';
			} else {
				$retVal[0] = 2;
				$retText .= ' Ponechana puvodni identicka hodnota ' . json_encode($var) . ' (' . gettype($var) . '). ';
			}

			$retVal[1] = self::dumpSmallVar($oriVar, array(self::TITLE_TYPE => 1, self::DUMP_ID => TRUE));
			$retVal[2] = $retText . '</div></div></pre>';
		} elseif ($step === 2 || $step === 4 || $step === 6) {
			if (!is_array($var)) throw new Exception('Promenna typu ' . gettype($var) . ', ocekavano pole.', 9);
			$index = $varPath[1]['key'];
			if (!isset($var[$index])) throw new Exception('Pole nema definovan prvek s indexem ' . $index, 9);
			if ($type === 2 && !empty($varPath[0]['unset'])) {
				$oriVar = $var;
				unset($var[$index]);
				if (!isset($var[$index])) {
					$retVal[0] = 1;
					$retVal[1] = self::dumpSmallVar($oriVar[$index], array(self::TITLE_TYPE => 1, self::DUMP_ID => TRUE));
					$retVal[2] = '<pre' . ( $name ? ' id="' . $name . '"' : '') . ' class="nd-result nd-unseted"><div class="nd-rollover">'
							. '<div class="nd-indenter"> Odstranen prvek z pole s indexem "' . $index . '" s hodnotou ' . json_encode($oriVar[$index])
							. ' (' . gettype($oriVar[$index]) . '). </div></div></pre>';
				} else throw new Exception('Nepovedlo se odebrani prvku z pole na indexu "' . $varPath[0]['key'] . '".', 9);
			} else {
				$retVal = self::applyChange($var[$index], array_slice($varPath, 1), $value, $name, $type, $hash);
			}
		} elseif ($step === 1 || $step === 3 || $step === 5) {
			if (!is_object($var)) throw new Exception('Promenna typu ' . gettype($var) . ', ocekavan objekt.', 9);
			if ($step === 1) {
				$objClass = $varPath[0]['key'];
				if (get_class($var) !== $objClass) {
					throw new Exception('Objekt je tridy ' . get_class($var) . ' ocekavana ' . $objClass . '.', 9);
				}
			} else $objClass = get_class($var);
			$property = $varPath[1]['key'];
			if ($priv) {
				if (!isset($varArray, $property)) {
					throw new Exception('Objekt tridy "' . $objClass . '" nema dostupnou property: ' . $property . '.', 9);
				}
				$retVal = self::applyChange($varArray[$property], array_slice($varPath, 1), $value, $name, $type, $hash);
				if ($priv === 2) {
					$refObj = new ReflectionObject($var);
					$refProp = $refObj->getProperty($property);
					$refProp->setAccessible(TRUE);
					$refProp->setValue($var, $varArray[$property]);
				}
			} else {
				if (!property_exists($var, $property)) {
					throw new Exception('Objekt tridy "' . $objClass . '" nema dostupnou property: ' . $property . '.', 9);
				}
				$retVal = self::applyChange($var->$property, array_slice($varPath, 1), $value, $name, $type, $hash);
			}
		} else throw new Exception('Byl zadan spatny typ cesty pro zmenu v promenne "' . $step . '", ocekavano cislo 0 az 9.', 8);
		return $retVal;
	}


	private static function dumpSmallVar(&$var = NULL, array $options = NULL) {
		$options = (array) $options + array(
			self::APP_RECURSION => FALSE,
			self::DEPTH => 2,
			self::COLLAPSE => FALSE,
			self::COLLAPSE_COUNT => 5,
			self::TRUNCATE => 30,
			self::NO_BREAK => FALSE
		);
		return self::dumpVar($var, $options);
	}


	private static function getGetText() {
		$retArray = array();
		foreach (self::$get as $key => $value) $retArray[] = $key . '=' . urlencode($value);
		return implode('&', $retArray);
	}


	private static function getPostArray() {
		$retArray = array();
		foreach (self::$post as $key => $value) $retArray[] = array($key, $value);
		return $retArray;
	}


	public static function getResponse() {
		$response = array();
		if (empty(self::$request['count'])) return $response;

		for ($i = 0; $i < self::$request['count']; ++$i) {
			$change = self::$request[$i];
			if (empty($change['res'])) {
				$change = array(
					'path' => $change['path'],
					'value' => $change['value'],
					'type' => $change['type'],
					'fullHeight' => $change['fullHeight'],
					'res' => 0
				);
			}
			$response[] = $change;
		}
		return $response;
	}


	public static function runtime($minus = NULL) {
		if ($minus === NULL) $minus = self::$startTime;
		return self::num(((self::$lastRuntime = microtime(TRUE)) - $minus) * 1000, 0, 'ms', $minus !== self::$startTime);
	}


	public static function memory($minus = NULL) {
		if ($minus === NULL) $minus = self::$startMem;
		return self::num(((self::$lastMemory = memory_get_usage()) - $minus) / 1024, 0, 'kB', $minus !== self::$startMem);
	}


	public static function maxMem($real = FALSE) {
		return self::num(memory_get_peak_usage($real) / 1024, 0, 'kB');
	}


	private static function num($val = 0, $decs = 2, $units = '', $delta = FALSE) {
		return ($delta && ($val = round($val, $decs)) > 0 ? '+' : '') . number_format($val, $decs, ',', ' ') . ($units ? " $units" : '');
	}


	private static function toHtml($var, array $options = NULL, $hash = '') {
		return '<pre' . ($hash ? ' data-hash="' . $hash . '"' : '')
				. (!empty($options[self::DUMP_ID]) ? ' data-runtime="' . number_format(1000*(microtime(TRUE)-self::$startTime),2,'.','')
				. '" id="' . $options[self::DUMP_ID] . '" class="nd nd-dump"': ' class="nd"')
				. (isset($options[self::TDVIEW_INDEX]) ? ' data-tdindex="' . $options[self::TDVIEW_INDEX] . '">' : '>')
				. self::dumpVar($var, (array) $options + array(
					self::DEPTH => 8,
					self::TRUNCATE => 70,
					self::COLLAPSE => FALSE,
					self::COLLAPSE_COUNT => 7,
					self::NO_BREAK => FALSE,
					self::APP_RECURSION => is_object($var) && (get_class($var) !== self::$recClass)
				)) . "</pre>";
	}


	private static function incCounter($cType = 'titles') {
		if (isset(self::$idCounters[$cType])) {
			if (isset(self::$idCounters[$cType][self::$idPrefix])) return ++self::$idCounters[$cType][self::$idPrefix];
			else return self::$idCounters[$cType][self::$idPrefix] = 1;
		} else {
			if (isset(self::$idCounters['hashes'][$cType])) return ++self::$idCounters['hashes'][$cType];
			else return self::$idCounters['hashes'][$cType] = 1;
		}
	}


	private static function findLocation($getMethod = FALSE) {
		$backtrace = debug_backtrace(FALSE);
		foreach ($backtrace as $id => $item) {
			if (isset($backtrace[$id + 1], $item['class']) && $item['class'] === 'TimeDebug') {
				continue;
			} elseif (!isset($item['file'], $item['line']) || !is_file($item['file'])) {
				break;
			} else {
				$lines = file($item['file']);
				$line = trim($lines[$item['line'] - 1]);

				++$id;
				while (!isset($backtrace[$id]['function'], $backtrace[$id]['class'], $backtrace[$id]['type'])) {
					if (!isset($backtrace[++$id])) {
						$id = 0;
						break;
					}
				}

				if ($id) $place = $backtrace[$id]['class'] . '|' . $backtrace[$id]['type'] . '|' . $backtrace[$id]['function'];
				else $place = '';

				if (!$getMethod) $code = preg_match('#\w*dump(er::\w+)?\(.*\)#i', $line, $m) ? $m[0] : $line;
				else if ($id) {
					$args = array();
					if (!empty($backtrace[$id]['args'])) {
						for ($i = 0, $j = count($backtrace[$id]['args']); $i < $j; ++$i) {
							$arg = $backtrace[$id]['args'][$i];
							if(self::$advancedLog && is_array($arg) && $cnt = count($arg)) {
								$args[] = '<span class="nd-array nd-titled"><span id="t' . self::$idPrefix . '_' . self::incCounter()
										. '" class="nd-title" data-pk="' . $i . '" data-tt="2"><strong class="nd-inner"><pre class="nd">'
										. self::dumpSmallVar($arg, array(self::TITLE_TYPE => 2)) . '</pre></strong></span>array</span> (' . $cnt . ')';
							} else {
								$args[] = self::dumpVar($arg, array(
									self::APP_RECURSION => FALSE,
									self::DEPTH => -1,
									self::TRUNCATE => 10,
									self::NO_BREAK => TRUE,
									self::TITLE_TYPE => 2,
									self::TITLE_DATA => $i
								));
							}
						}
					}

					$lines = file($backtrace[$id]['file']);
					$line = trim($lines[$backtrace[$id]['line'] - 1]);

					$code = '<span title="' . htmlspecialchars($line . "\nin " . substr($backtrace[$id]['file'], strlen(self::$root))
							. ' @' . $backtrace[$id]['line'], ENT_COMPAT) . '">' . $backtrace[$id]['class']
							. $backtrace[$id]['type'] . $backtrace[$id]['function'] . '</span>(' . implode(', ', $args) . ')';
				} else $code = '';

				return array($item['file'], $item['line'], $code, $place);
			}
		}
		return false;
	}


	private static function dumpVar(&$var, array $options, $level = 0) {
		if (method_exists(__CLASS__, $m = 'dump' . gettype($var))) {
			return self::$m($var, $options, $level);
		} else {
			return "<span>unknown type</span>" . ($options[self::NO_BREAK] ? '' : "\n");
		}
	}


	private static function dumpNull(&$var, $options, $level) {
		return '<span class="nd-null' . (($level || empty($options[self::DUMP_ID])) ? '' : ' nd-top') . '">NULL</span>'
				. ($options[self::NO_BREAK] ? '' : "\n");
	}


	private static function dumpBoolean(&$var, $options, $level) {
		return '<span class="nd-bool' . (($level || empty($options[self::DUMP_ID])) ? '' : ' nd-top') . '">'
				. ($var ? 'TRUE' : 'FALSE') . "</span>" . ($options[self::NO_BREAK] ? '' : "\n");
	}

	
	private static function dumpInteger(&$var, $options, $level) {
		return "<span class=\"nd-number" . (($level || empty($options[self::DUMP_ID])) ? '' : ' nd-top') . "\">$var</span>"
				. ($options[self::NO_BREAK] ? '' : "\n");
	}


	private static function dumpDouble(&$var, $options, $level) {
		$var = var_export($var, TRUE);
		return '<span class="nd-number' . (($level || empty($options[self::DUMP_ID])) ? '' : ' nd-top') . '">' . $var
				. (strpos($var, '.') === FALSE ? '.0' : '') . "</span>" . ($options[self::NO_BREAK] ? '' : "\n");
	}


	private static function dumpString(&$var, $options, $level) {
		if ($options[self::TRUNCATE] && ($varLen = strlen($var)) > $options[self::TRUNCATE]) {
			if (!isset($options[self::PARENT_KEY])) $arrKey = FALSE;
			elseif ($options[self::PARENT_KEY][0] === '#') $arrKey = substr($options[self::PARENT_KEY], 1);
			else $arrKey = $options[self::PARENT_KEY];

			$retVal = '"' . self::encodeString(substr($var, 0, min($options[self::TRUNCATE], 512)), TRUE)
					. '&hellip;"</span> (' . $varLen . ')';

			if ($arrKey === FALSE) $data = isset($options[self::TITLE_DATA]) ? ' data-pk="' . $options[self::TITLE_DATA] . '"' : '';
			else $data = ' data-pk="' . $arrKey . '"';
			$retTitle = self::$advancedLog ? '<span id="t' . self::$idPrefix . '_' . self::incCounter()
					. '" class="nd-title nd-color"' . $data . ' data-tt="' . (isset($options[self::TITLE_TYPE]) ? $options[self::TITLE_TYPE] : 3)
					. '"><strong class="nd-inner"><i>' . str_replace(array('\\r', '\\n', '\\t'), array('<b>\\r</b>', '<b>\\n</b></i><i>', '<b>\\t</b>'),
						self::encodeString(substr($var, 0, max($options[self::TRUNCATE], 1024)), TRUE))
					. ($varLen > 1024 ? '&hellip; &lt; TRUNCATED to 1kB &gt;' : '') . '</i></strong></span>' : '';

			$retClass = self::$advancedLog ? ' nd-titled' : '';
		} else {
			$retTitle = '';
			$retVal = self::encodeString($var) . '</span>';
			$retClass = '';
		}

		$retVal = str_replace(array('\\r', '\\n', '\\t'), array('<b>\\r</b>', '<b>\\n</b>', '<b>\\t</b>'), $retVal);

		return '<span class="nd-string' . $retClass . (($level || empty($options[self::DUMP_ID])) ? '' : ' nd-top') . '">'
				. $retTitle . $retVal . ($options[self::NO_BREAK] ? '' : "\n");
	}


	private static function dumpArray(&$var, $options, $level) {
		if (!isset($options[self::PARENT_KEY])) $parentKey = $arrKey = FALSE;
		elseif ($options[self::PARENT_KEY][0] === '#') {
			$parentKey = '4' . substr($options[self::PARENT_KEY], 1);
			$arrKey = '7' . substr($options[self::PARENT_KEY], 1);
		} else {
			$parentKey = '6' . $options[self::PARENT_KEY];
			$arrKey = '8' . $options[self::PARENT_KEY];
		}

		static $marker;
		if ($marker === NULL) {
			$marker = uniqid("\x00", TRUE);
		}

		$out = '<span class="nd-array' . (($level || empty($options[self::DUMP_ID])) ? '' : ' nd-top')
				. ($arrKey ? '" data-pk="' . $arrKey : '') . '">array</span> (';

		if (empty($var)) {
			return $out . '0)' . ($options[self::NO_BREAK] ? '' : "\n");

		} elseif (isset($var[$marker])) {
			return $out . (count($var) - 1) . ") [ <i>RECURSION</i> ]" . ($options[self::NO_BREAK] ? '' : "\n");

		} elseif (!$options[self::DEPTH] || $level < $options[self::DEPTH]) {
			$collapsed = $level ? count($var) >= $options[self::COLLAPSE_COUNT] : $options[self::COLLAPSE];
			$out = '<span class="nd-toggle nette-toggle' . ($collapsed ? '-collapsed">' : '">') . $out . count($var)
					. ")</span>\n<div" . ($collapsed ? ' class="nette-collapsed"' : '')
					. (self::$advancedLog && $parentKey ? " data-pk=\"$parentKey\">" : (!$level ? " data-pk=\"2\">" : '>'));
			$var[$marker] = TRUE;
			foreach ($var as $k => &$v) {
				if ($k !== $marker) {
					$out .= '<span class="nd-key">'
							. (preg_match('#^\w+\z#', $k) ? $myKey = $k : '"' . ($myKey = self::encodeString($k, TRUE)) . '"')
							. '</span> => ' . self::dumpVar($v, array(self::PARENT_KEY => "$myKey") + $options, $level + 1);
				}
			}
			unset($var[$marker]);
			return $out . '</div>';

		} else {
			return $out . count($var) . ")" . ($options[self::NO_BREAK] ? '' : " [ ... ]\n");
		}
	}


	private static function dumpObject(&$var, $options, $level) {
		if (!isset($options[self::PARENT_KEY])) $parentKey = FALSE;
		elseif ($options[self::PARENT_KEY][0] === '#') $parentKey = '3' . substr($options[self::PARENT_KEY], 1);
		else $parentKey = '5' . $options[self::PARENT_KEY];

		$fields = (array) $var;

		static $list = array();
		$varClass = get_class($var);
		$out = '<span class="nd-object' . (($level || empty($options[self::DUMP_ID])) ? '' : ' nd-top') . '">' . $varClass
				. "</span> (" . count($fields) . ')';

		if (empty($fields)) {
			return $options[self::NO_BREAK] ? $out : "$out\n";

		} elseif (in_array($var, $list, TRUE) || ($options[self::APP_RECURSION] && $varClass === self::$recClass)) {
			return $out . " { <i>RECURSION</i> }" . ($options[self::NO_BREAK] ? '' : "\n");

		} elseif (!$options[self::DEPTH] || $level < $options[self::DEPTH]) {
			$collapsed = $level ? count($fields) >= $options[self::COLLAPSE_COUNT] : $options[self::COLLAPSE];
			$out = '<span class="nd-toggle nette-toggle' . ($collapsed ? '-collapsed">' : '">') . $out . "</span>\n<div"
					. ($collapsed ? ' class="nette-collapsed"' : '')
					. (self::$advancedLog && $parentKey ? " data-pk=\"$parentKey\">" : (!$level ? " data-pk=\"1$varClass\">" : '>'));
			$list[] = $var;
			foreach ($fields as $k => &$v) {
				$vis = '';
				if ($k[0] === "\x00") {
					$vis = ' <span class="nd-visibility">' . ($k[1] === '*' ? 'protected' : 'private') . '</span>';
					$k = substr($k, strrpos($k, "\x00") + 1);
				}
				$out .= '<span class="nd-key"' . ($vis ? ' data-pk="7">' : '>')
						. (preg_match('#^\w+\z#', $k) ? $myKey = $k : '"' . ($myKey = self::encodeString($k, TRUE)) . '"')
						. "</span>$vis => " . self::dumpVar($v, array(self::PARENT_KEY => $vis ? "#$myKey" : "$myKey") + $options, $level + 1);
			}
			array_pop($list);
			return $out . '</div>';

		} else {
			return $options[self::NO_BREAK] ? "$out" : "$out { ... }\n";
		}
	}


	private static function dumpResource(&$var, $options, $level) {
		$type = get_resource_type($var);
		$out = '<span class="nd-resource">' . htmlSpecialChars($type) . ' resource</span>';
		if (isset(self::$resources[$type])) {
			$out = "<span class=\"nd-toggle nette-toggle-collapsed\">$out</span>\n<div class=\"nette-collapsed\">";
			foreach (call_user_func(self::$resources[$type], $var) as $k => $v) {
				$out .= '<span class="nd-key">' . htmlSpecialChars($k) . "</span> => " . self::dumpVar($v, $options, $level + 1);
			}
			return $out . '</div>';
		}
		return $options[self::NO_BREAK] ? $out : "$out\n";
	}


	private static function encodeString($s, $truncated = FALSE) {
		static $utf, $binary;
		if ($utf === NULL) {
			foreach (range("\x00", "\xFF") as $ch) {
				if (ord($ch) < 32 && strpos("\r\n\t", $ch) === FALSE) {
					$utf[$ch] = $binary[$ch] = '\\x' . str_pad(dechex(ord($ch)), 2, '0', STR_PAD_LEFT);
				} elseif (ord($ch) < 127) {
					$utf[$ch] = $binary[$ch] = $ch;
				} else {
					$utf[$ch] = $ch; $binary[$ch] = '\\x' . dechex(ord($ch));
				}
			}
			$binary["\\"] = '\\\\';
			$utf["\t"] = $binary["\t"] = '\\t';
			$utf["\r"] = $binary["\r"] = '\\r';
			$utf["\n"] = $binary["\n"] = '\\n';
			$utf['\\x'] = $binary['\\x'] = '\\\\x';
		}

		$s = strtr($s, preg_match('#[^\x09\x0A\x0D\x20-\x7E\xA0-\x{10FFFF}]#u', $s) || preg_last_error() ? $binary : $utf);
		return $truncated ? htmlSpecialChars($s, ENT_NOQUOTES) : '"' . htmlSpecialChars($s, ENT_NOQUOTES) . '"';
	}

}

