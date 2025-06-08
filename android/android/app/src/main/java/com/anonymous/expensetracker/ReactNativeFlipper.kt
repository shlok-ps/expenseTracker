package com.anonymous.expensetracker // Update to match your actual package

import android.content.Context
import android.util.Log
import com.facebook.flipper.android.AndroidFlipperClient
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin
import com.facebook.flipper.plugins.inspector.DescriptorMapping
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin
import com.facebook.flipper.plugins.databases.DatabasesFlipperPlugin
import com.facebook.react.ReactInstanceManager

object ReactNativeFlipper {
    @JvmStatic
    fun initializeFlipper(context: Context, reactInstanceManager: ReactInstanceManager) {
        val client = AndroidFlipperClient.getInstance(context)

        client.addPlugin(InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()))
        client.addPlugin(SharedPreferencesFlipperPlugin(context))
        client.addPlugin(NetworkFlipperPlugin())
        client.addPlugin(DatabasesFlipperPlugin(context))
        client.start()
    }
}

