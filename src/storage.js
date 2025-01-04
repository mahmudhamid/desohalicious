import { get, set, del } from 'idb-keyval';
import { DateTime } from 'luxon';

export async function idbGet(key, deflt) {
    try {
        const { value, createdAt, ttl } = await get(key) || {};
        const ts = DateTime.now().toSeconds();

        if (!value) {
            return deflt || null
        }

        switch (key) {
            case "cd":
                if (sessionStorage.getItem("cd") != value.id) {
                    await del("cd");
                    await del("cid");
                    return deflt || null
                }
                break;
            default:
                if ((ts - createdAt) > ttl && !sessionStorage.getItem(key)) {
                    await del(key);
                    return deflt || null
                }
                break;
        }

        return value
    } catch (error) {
        throw error
    }
}

export async function idbSet(key, value, ttl) {
    let item = {
        value,
        createdAt: DateTime.now().toSeconds(),
        ttl: ttl || 0
    }

    if (!ttl) {
        switch (key) {
            case "cd":
                sessionStorage.setItem("cd", value.id);
                break;
            default:
                sessionStorage.setItem(key, "1");
                break;
        }
    }

    try {
        const dbItem = await idbGet(key, {});
        if (dbItem.value) {
            item.createdAt = dbItem.createdAt;
            item.ttl = dbItem.ttl
        }
        await set(key, item);
    } catch (error) {
        throw error
    }
}