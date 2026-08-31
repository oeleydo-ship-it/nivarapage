<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug'])]
class TemplateCategory extends Model
{
    public function templates(): HasMany
    {
        return $this->hasMany(Template::class);
    }
}
