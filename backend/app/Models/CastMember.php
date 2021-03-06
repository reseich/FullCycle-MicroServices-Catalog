<?php

namespace App\Models;

use App\ModelFilters\CastMemberFilter;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMember extends Model
{
    use SoftDeletes, Uuid, Filterable;

    const TYPE_DIRECTOR = 1;
    const TYPE_ACTOR = 2;

    public static $types = [self::TYPE_ACTOR, self::TYPE_DIRECTOR];

    protected $fillable = ['name', 'type'];
    protected $dates = ['deleted_at'];
    protected $casts = ['id' => 'string', 'type' => 'integer'];
    public $incrementing = false;
    protected $keyType = 'string';

    public function modelFilter()
    {
        return $this->provideFilter(CastMemberFilter::class);
    }
}
