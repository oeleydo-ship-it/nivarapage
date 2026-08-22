<?php

namespace App\Services;

class HtmlSanitizer
{
    /**
     * Conservative tags for public form fields.
     *
     * @var list<string>
     */
    private array $allowedTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'blockquote', 'code',
    ];

    /**
     * Tags produced by the dashboard article editor.
     *
     * @var list<string>
     */
    private array $articleTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'mark', 'sub', 'sup',
        'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code', 'hr', 'img', 'span',
        'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ];

    public function sanitize(string $value): string
    {
        return $this->clean($value, $this->allowedTags);
    }

    public function sanitizeArticle(string $value): string
    {
        return $this->clean($value, $this->articleTags);
    }

    /**
     * @param  list<string>  $allowedTags
     */
    private function clean(string $value, array $allowedTags): string
    {
        $stripped = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $value) ?? $value;
        $stripped = strip_tags($stripped, '<'.implode('><', $allowedTags).'>');
        $stripped = preg_replace('/on\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $stripped) ?? $stripped;
        $stripped = preg_replace('/javascript\s*:/i', '', $stripped) ?? $stripped;

        return $stripped;
    }
}
