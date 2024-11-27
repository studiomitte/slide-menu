<?php

declare(strict_types=1);

namespace StudioMitte\Theme\ViewHelpers;

use TYPO3\CMS\Core\Utility\DebugUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3Fluid\Fluid\Core\ViewHelper\Traits\CompileWithRenderStatic;
use TYPO3\CMS\Core\Utility\RootlineUtility;

/**
 * @example
 * <html xmlns:f="http://typo3.org/ns/TYPO3/CMS/Fluid/ViewHelpers" xmlns:theme="http://typo3.org/ns/StudioMitte/Theme/ViewHelpers" data-namespace-typo3-fluid="true">
 * 
 * <f:variable name="closestInMenuRootline" value="{theme:typo3ExampleMenu(depth: 3)}"></f:variable>
 */
class Typo3ExampleMenuViewhelper extends AbstractViewHelper
{
    use CompileWithRenderStatic;

    protected $escapeOutput = false;

    /**
     * Initialize arguments
     */
    public function initializeArguments(): void
    {
        $this->registerArgument(
            'needle',
            'int',
            'Page ID to check if in rootline (Default = root page ID)',
            false,
            null,
        );
        $this->registerArgument(
            'default',
            'int',
            'Default value to return if page needle is not found in rootline (Default = root page ID)',
            false,
            null
        );
        $this->registerArgument(
            'depth',
            'int',
            'Depth of the rootline to consider for searching for arg "needle" starting from arg "start" (Default = 3)',
            false,
            3
        );
        $this->registerArgument(
            'start',
            'int',
            'Start Page ID for getting the rootline (Default = current page ID)',
            false,
            null
        );
    }

    public static function renderStatic(array $arguments, \Closure $renderChildrenClosure, RenderingContextInterface $renderingContext)
    {
        $default = $arguments['default'];
        $depth = $arguments['depth'];
        $start = $arguments['start'];

        $currentPid = null === $start ? $GLOBALS['TSFE']->id : $start;
        $rootline = self::getRootLine($currentPid, reverse: true);
        $rootlineUids = array_map(static fn ($page): int => $page['uid'], $rootline);

        $rootUid = $rootlineUids[0];
        $needle = $arguments['needle'] === null ? $rootUid : $arguments['needle'];

        if (in_array($needle, $rootlineUids)) {
            // Return closest parent of needle within depth
            $rootlineUids = array_slice($rootlineUids, 0, $depth);          
            return end($rootlineUids);
        }

        return null === $default ? $rootUid : $default;
    }

    public static function getRootLine(
        ?int $pageUid = null,
        bool $reverse = false
    ): array {
        if (null === $pageUid) {
            $pageUid = $GLOBALS['TSFE']->id;
        }
        /** @var RootlineUtility $rootLineUtility */
        $rootLineUtility = GeneralUtility::makeInstance(RootlineUtility::class, $pageUid);
        $rootline = $rootLineUtility->get();
        if ($reverse) {
            $rootline = array_reverse($rootline);
        }
        return $rootline;
    }
}
