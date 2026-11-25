<?php

namespace App\Modifiers;

use Illuminate\Support\Str;
use Statamic\Facades\Taxonomy;
use Statamic\Modifiers\Modifier;

class TaxonomyTitle extends Modifier
{
    /**
     * Return the configured title of a taxonomy from its handle,
     * falling back to the title-cased handle if the taxonomy is not found.
     *
     * Usage: {{ tax | taxonomy_title }}
     *
     * @param mixed  $value    The taxonomy handle
     * @return string
     */
    public function index($value)
    {
        $handle = (string) $value;
        $taxonomy = Taxonomy::findByHandle($handle);

        return $taxonomy?->title() ?? Str::title($handle);
    }
}
